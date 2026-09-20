import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { PreguntaHttpService } from '../../../core/services/pregunta-http.service';
import { CuestionarioHttpService } from '../../../core/services/cuestionario-http.service';
import {
  PreguntaResponse, CreatePreguntaRequest, UpdatePreguntaRequest,
  CreateOpcionRequest, CreateCasoDePruebaRequest, CuestionarioResponse
} from '../../../core/models';
import { TipoPregunta, LenguajeProgramacion } from '../../../core/models/enums.model';

interface OpcionForm {
  texto: string;
  esCorrecta: boolean;
}

interface CasoForm {
  input: string;
  expectedOutput: string;
}

@Component({
  selector: 'app-pregunta-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule,
    DialogModule, InputTextModule, InputTextareaModule, InputNumberModule,
    DropdownModule, MultiSelectModule, CheckboxModule, TagModule, ChipModule, AccordionModule,
    TooltipModule, ConfirmDialogModule, ToastModule, BreadcrumbModule, DividerModule
  ],
  templateUrl: './pregunta-list.component.html'
})
export class PreguntaListComponent implements OnInit {
  cuestionarioId!: number;
  cuestionario?: CuestionarioResponse;
  preguntas: PreguntaResponse[] = [];
  loading = true;

  dialogVisible = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  titulo = '';
  descripcion = '';
  tipoPregunta: TipoPregunta = TipoPregunta.OPCION_UNICA;
  lenguajesPermitidos: LenguajeProgramacion[] = [];
  puntaje: number = 10;

  opciones: OpcionForm[] = [];
  casos: CasoForm[] = [];
  private opcionesBackup: OpcionForm[] = [];
  private casosBackup: CasoForm[] = [];
  private lenguajeBackup: LenguajeProgramacion[] = [];

  tipoOptions = [
    { label: 'Opcion Unica', value: TipoPregunta.OPCION_UNICA },
    { label: 'Opcion Multiple', value: TipoPregunta.OPCION_MULTIPLE },
    { label: 'Codigo', value: TipoPregunta.CODIGO }
  ];

  lenguajeOptions = [
    { label: 'Java', value: LenguajeProgramacion.JAVA },
    { label: 'JavaScript', value: LenguajeProgramacion.JAVASCRIPT },
    { label: 'Python', value: LenguajeProgramacion.PYTHON }
  ];

  // Vincular dialog
  vincularDialogVisible = false;
  todasPreguntas: PreguntaResponse[] = [];
  preguntasDisponibles: PreguntaResponse[] = [];
  selectedPreguntas: PreguntaResponse[] = [];
  loadingVincular = false;
  vinculando = false;

  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private preguntaService: PreguntaHttpService,
    private cuestionarioService: CuestionarioHttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cuestionarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.cuestionarioService.getById(this.cuestionarioId).subscribe(c => {
      this.cuestionario = c;
      this.breadcrumbItems = [
        { label: 'Dashboard', routerLink: '/admin' },
        { label: 'Cuestionarios', routerLink: '/admin/cuestionarios' },
        { label: c.nombre }
      ];
    });
    this.loadPreguntas();
  }

  loadPreguntas(): void {
    this.loading = true;
    this.preguntaService.getByCuestionario(this.cuestionarioId).subscribe({
      next: data => {
        this.preguntas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las preguntas' });
      }
    });
  }

  openNew(): void {
    this.editMode = false;
    this.selectedId = null;
    this.titulo = '';
    this.descripcion = '';
    this.tipoPregunta = TipoPregunta.OPCION_UNICA;
    this.lenguajesPermitidos = [];
    this.puntaje = 10;
    this.opciones = [{ texto: '', esCorrecta: false }, { texto: '', esCorrecta: false }];
    this.casos = [];
    this.opcionesBackup = [];
    this.casosBackup = [];
    this.lenguajeBackup = [];
    this.dialogVisible = true;
  }

  openEdit(p: PreguntaResponse): void {
    this.editMode = true;
    this.selectedId = p.id;
    this.titulo = p.titulo;
    this.descripcion = p.descripcion || '';
    this.tipoPregunta = p.tipoPregunta;
    this.lenguajesPermitidos = p.lenguajesPermitidos || [];
    this.puntaje = p.puntaje;
    this.opciones = (p.opciones || []).map(o => ({ texto: o.texto, esCorrecta: o.esCorrecta }));
    this.casos = (p.casosDePrueba || []).map(c => ({ input: c.input || '', expectedOutput: c.expectedOutput }));
    this.opcionesBackup = [];
    this.casosBackup = [];
    this.lenguajeBackup = [];
    this.dialogVisible = true;
  }

  onTipoChange(): void {
    if (this.isCodigo()) {
      this.opcionesBackup = [...this.opciones];
      this.opciones = [];
      this.casos = this.casosBackup.length > 0 ? [...this.casosBackup] : [{ input: '', expectedOutput: '' }];
      this.lenguajesPermitidos = this.lenguajeBackup.length > 0 ? [...this.lenguajeBackup] : [LenguajeProgramacion.JAVA];
    } else {
      this.casosBackup = [...this.casos];
      this.lenguajeBackup = [...this.lenguajesPermitidos];
      this.casos = [];
      this.lenguajesPermitidos = [];
      this.opciones = this.opcionesBackup.length >= 2 ? [...this.opcionesBackup] : [{ texto: '', esCorrecta: false }, { texto: '', esCorrecta: false }];
    }
  }

  isCodigo(): boolean {
    return this.tipoPregunta === TipoPregunta.CODIGO;
  }

  isOpcion(): boolean {
    return this.tipoPregunta === TipoPregunta.OPCION_UNICA || this.tipoPregunta === TipoPregunta.OPCION_MULTIPLE;
  }

  onCorrectaChange(index: number): void {
    if (this.tipoPregunta === TipoPregunta.OPCION_UNICA && this.opciones[index].esCorrecta) {
      this.opciones.forEach((op, i) => {
        if (i !== index) op.esCorrecta = false;
      });
    }
  }

  addOpcion(): void {
    this.opciones.push({ texto: '', esCorrecta: false });
  }

  removeOpcion(index: number): void {
    this.opciones.splice(index, 1);
  }

  addCaso(): void {
    this.casos.push({ input: '', expectedOutput: '' });
  }

  removeCaso(index: number): void {
    this.casos.splice(index, 1);
  }

  save(): void {
    if (!this.titulo.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'El titulo es obligatorio' });
      return;
    }

    if (this.isOpcion()) {
      const opcionesConTexto = this.opciones.filter(o => o.texto.trim());
      if (opcionesConTexto.length < 2) {
        this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Debe haber al menos 2 opciones con texto' });
        return;
      }
      if (!opcionesConTexto.some(o => o.esCorrecta)) {
        this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Debe haber al menos una opcion marcada como correcta' });
        return;
      }
      if (this.tipoPregunta === TipoPregunta.OPCION_UNICA && opcionesConTexto.filter(o => o.esCorrecta).length > 1) {
        this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Opcion unica solo permite una respuesta correcta' });
        return;
      }
    }

    if (this.isCodigo()) {
      if (!this.casos.some(c => c.expectedOutput.trim())) {
        this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Debe haber al menos un caso de prueba con output esperado' });
        return;
      }
    }

    this.saving = true;

    if (this.editMode && this.selectedId) {
      const req: UpdatePreguntaRequest = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        tipoPregunta: this.tipoPregunta,
        lenguajesPermitidos: this.lenguajesPermitidos.length > 0 ? this.lenguajesPermitidos : undefined,
        puntaje: this.puntaje
      };
      this.preguntaService.update(this.selectedId, req).subscribe({
        next: () => {
          this.saveChildren(this.selectedId!);
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
        }
      });
    } else {
      const req: CreatePreguntaRequest = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        tipoPregunta: this.tipoPregunta,
        lenguajesPermitidos: this.lenguajesPermitidos.length > 0 ? this.lenguajesPermitidos : undefined,
        puntaje: this.puntaje
      };
      this.preguntaService.create(this.cuestionarioId, req).subscribe({
        next: (created) => {
          this.saveChildren(created.id);
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
        }
      });
    }
  }

  private saveChildren(preguntaId: number): void {
    const promises: Promise<void>[] = [];

    if (this.isOpcion()) {
      // Delete existing then add new (simpler for a reto)
      const existing = this.preguntas.find(p => p.id === preguntaId);
      if (existing && this.editMode) {
        (existing.opciones || []).forEach(o => {
          promises.push(new Promise((resolve, reject) => {
            this.preguntaService.deleteOpcion(o.id).subscribe({ next: () => resolve(), error: reject });
          }));
        });
      }
      this.opciones.filter(o => o.texto.trim()).forEach(o => {
        const req: CreateOpcionRequest = { texto: o.texto, esCorrecta: o.esCorrecta };
        promises.push(new Promise((resolve, reject) => {
          this.preguntaService.addOpcion(preguntaId, req).subscribe({ next: () => resolve(), error: reject });
        }));
      });
    }

    if (this.isCodigo()) {
      const existing = this.preguntas.find(p => p.id === preguntaId);
      if (existing && this.editMode) {
        (existing.casosDePrueba || []).forEach(c => {
          promises.push(new Promise((resolve, reject) => {
            this.preguntaService.deleteCasoDePrueba(c.id).subscribe({ next: () => resolve(), error: reject });
          }));
        });
      }
      this.casos.filter(c => c.expectedOutput.trim()).forEach(c => {
        const req: CreateCasoDePruebaRequest = { input: c.input, expectedOutput: c.expectedOutput };
        promises.push(new Promise((resolve, reject) => {
          this.preguntaService.addCasoDePrueba(preguntaId, req).subscribe({ next: () => resolve(), error: reject });
        }));
      });
    }

    if (promises.length === 0) {
      this.finishSave();
      return;
    }

    Promise.all(promises).then(() => this.finishSave()).catch(() => {
      this.saving = false;
      this.messageService.add({ severity: 'warn', summary: 'Parcial', detail: 'Pregunta guardada pero algunas opciones/casos fallaron' });
      this.dialogVisible = false;
      this.loadPreguntas();
    });
  }

  private finishSave(): void {
    this.saving = false;
    this.dialogVisible = false;
    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Pregunta guardada correctamente' });
    this.loadPreguntas();
  }

  confirmDesvincular(p: PreguntaResponse): void {
    this.confirmationService.confirm({
      message: `¿Desvincular la pregunta "${p.titulo}" de este cuestionario? La pregunta seguira disponible en el banco de preguntas.`,
      header: 'Confirmar desvinculacion',
      icon: 'pi pi-link',
      acceptLabel: 'Desvincular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.preguntaService.desvincular(p.id, this.cuestionarioId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Desvinculada', detail: 'Pregunta desvinculada del cuestionario' });
            this.loadPreguntas();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo desvincular' })
        });
      }
    });
  }

  confirmDelete(p: PreguntaResponse): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la pregunta "${p.titulo}" permanentemente? Se eliminara de todos los cuestionarios.`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.preguntaService.delete(p.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Pregunta eliminada permanentemente' });
            this.loadPreguntas();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  openVincular(): void {
    this.vincularDialogVisible = true;
    this.selectedPreguntas = [];
    this.loadingVincular = true;
    this.preguntaService.getAll().subscribe({
      next: data => {
        this.preguntasDisponibles = data.filter(p => !p.cuestionarios.some(c => c.id === this.cuestionarioId));
        this.loadingVincular = false;
      },
      error: () => {
        this.loadingVincular = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las preguntas' });
      }
    });
  }

  vincularSeleccionadas(): void {
    if (this.selectedPreguntas.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Seleccion', detail: 'Selecciona al menos una pregunta' });
      return;
    }
    this.vinculando = true;
    let completed = 0;
    let errors = 0;
    const total = this.selectedPreguntas.length;

    this.selectedPreguntas.forEach(p => {
      this.preguntaService.asociar(p.id, this.cuestionarioId).subscribe({
        next: () => {
          completed++;
          if (completed + errors === total) this.finishVincular(completed, errors);
        },
        error: () => {
          errors++;
          if (completed + errors === total) this.finishVincular(completed, errors);
        }
      });
    });
  }

  private finishVincular(completed: number, errors: number): void {
    this.vinculando = false;
    this.vincularDialogVisible = false;
    if (errors === 0) {
      this.messageService.add({ severity: 'success', summary: 'Vinculado', detail: `${completed} pregunta(s) vinculada(s) correctamente` });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Parcial', detail: `${completed} vinculada(s), ${errors} con error` });
    }
    this.loadPreguntas();
  }

  getTipoSeverity(tipo: TipoPregunta): 'info' | 'warning' | 'contrast' {
    switch (tipo) {
      case TipoPregunta.OPCION_UNICA: return 'info';
      case TipoPregunta.OPCION_MULTIPLE: return 'contrast';
      case TipoPregunta.CODIGO: return 'warning';
      default: return 'info';
    }
  }

  getTipoLabel(tipo: TipoPregunta): string {
    switch (tipo) {
      case TipoPregunta.OPCION_UNICA: return 'Opcion Unica';
      case TipoPregunta.OPCION_MULTIPLE: return 'Opcion Multiple';
      case TipoPregunta.CODIGO: return 'Codigo';
      default: return tipo;
    }
  }
}
