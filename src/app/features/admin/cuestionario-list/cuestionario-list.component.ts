import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgIconComponent } from '@ng-icons/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { CuestionarioHttpService } from '../../../core/services/cuestionario-http.service';
import { AsignacionHttpService } from '../../../core/services/asignacion-http.service';
import { CuestionarioResponse, CreateCuestionarioRequest, UpdateCuestionarioRequest, AsignacionResponse, UsuarioSimpleResponse } from '../../../core/models';

@Component({
  selector: 'app-cuestionario-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule,
    DialogModule, InputTextModule, InputTextareaModule, InputNumberModule,
    InputSwitchModule, TagModule, TooltipModule, ConfirmDialogModule,
    ToastModule, BreadcrumbModule, CalendarModule, MultiSelectModule, NgIconComponent
  ],
  templateUrl: './cuestionario-list.component.html',
  styleUrl: './cuestionario-list.component.scss'
})
export class CuestionarioListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  cuestionarios: CuestionarioResponse[] = [];
  loading = true;
  searchValue = '';

  dialogVisible = false;
  editMode = false;
  selectedId: number | null = null;

  nombre = '';
  descripcion = '';
  tiempoLimite: number = 60;
  maxIntentos: number | null = null;

  breadcrumbItems: MenuItem[] = [
    { label: 'Dashboard', routerLink: '/admin' },
    { label: 'Cuestionarios' }
  ];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  // Asignacion dialog
  asignacionDialogVisible = false;
  asignacionCuestionarioId: number | null = null;
  asignacionCuestionarioNombre = '';
  asignaciones: AsignacionResponse[] = [];
  candidatos: UsuarioSimpleResponse[] = [];
  selectedCandidatos: UsuarioSimpleResponse[] = [];
  disponibleDesde: Date | null = null;
  disponibleHasta: Date | null = null;
  loadingAsignaciones = false;

  constructor(
    private cuestionarioService: CuestionarioHttpService,
    private asignacionService: AsignacionHttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCuestionarios();
  }

  onFilter(event: Event): void {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dt.filterGlobal('', 'contains');
  }

  loadCuestionarios(): void {
    this.loading = true;
    this.cuestionarioService.getAll().subscribe({
      next: data => {
        this.cuestionarios = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los cuestionarios' });
      }
    });
  }

  openNew(): void {
    this.editMode = false;
    this.selectedId = null;
    this.nombre = '';
    this.descripcion = '';
    this.tiempoLimite = 60;
    this.maxIntentos = null;
    this.dialogVisible = true;
  }

  openEdit(c: CuestionarioResponse): void {
    this.editMode = true;
    this.selectedId = c.id;
    this.nombre = c.nombre;
    this.descripcion = c.descripcion;
    this.tiempoLimite = c.tiempoLimite;
    this.maxIntentos = c.maxIntentos;
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'El nombre es obligatorio' });
      return;
    }

    if (!this.maxIntentos || this.maxIntentos < 1) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Los intentos permitidos son obligatorios' });
      return;
    }

    if (this.editMode && this.selectedId) {
      const req: UpdateCuestionarioRequest = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        tiempoLimite: this.tiempoLimite,
        maxIntentos: this.maxIntentos!
      };
      this.cuestionarioService.update(this.selectedId, req).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Cuestionario actualizado' });
          this.dialogVisible = false;
          this.loadCuestionarios();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
      });
    } else {
      const req: CreateCuestionarioRequest = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        tiempoLimite: this.tiempoLimite,
        maxIntentos: this.maxIntentos!
      };
      this.cuestionarioService.create(req).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Cuestionario creado' });
          this.dialogVisible = false;
          this.loadCuestionarios();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
      });
    }
  }

  confirmDelete(c: CuestionarioResponse): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el cuestionario "${c.nombre}"? Esta accion no se puede deshacer.`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cuestionarioService.delete(c.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Cuestionario eliminado' });
            this.loadCuestionarios();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  toggleActivo(c: CuestionarioResponse): void {
    const req: UpdateCuestionarioRequest = { activo: c.activo };
    this.cuestionarioService.update(c.id, req).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Estado actualizado',
          detail: c.activo ? 'Cuestionario activado' : 'Cuestionario desactivado'
        });
      },
      error: () => {
        c.activo = !c.activo;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
      }
    });
  }

  goToPreguntas(c: CuestionarioResponse): void {
    this.router.navigate(['/admin/cuestionarios', c.id, 'preguntas']);
  }

  getSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  // --- Asignaciones ---

  openAsignacionDialog(c: CuestionarioResponse): void {
    this.asignacionCuestionarioId = c.id;
    this.asignacionCuestionarioNombre = c.nombre;
    this.selectedCandidatos = [];
    this.disponibleDesde = null;
    this.disponibleHasta = null;
    this.asignacionDialogVisible = true;
    this.loadAsignaciones(c.id);
    this.loadCandidatos();
  }

  loadAsignaciones(cuestionarioId: number): void {
    this.loadingAsignaciones = true;
    this.asignacionService.getByCuestionario(cuestionarioId).subscribe({
      next: data => {
        this.asignaciones = data;
        this.loadingAsignaciones = false;
      },
      error: () => {
        this.loadingAsignaciones = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las asignaciones' });
      }
    });
  }

  loadCandidatos(): void {
    this.asignacionService.getCandidatos().subscribe({
      next: data => this.candidatos = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los evaluados' })
    });
  }

  guardarAsignacion(): void {
    if (!this.selectedCandidatos.length || !this.disponibleDesde || !this.disponibleHasta || !this.asignacionCuestionarioId) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Seleccione evaluados y fechas' });
      return;
    }

    if (this.disponibleHasta <= this.disponibleDesde) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'La fecha "hasta" debe ser posterior a "desde"' });
      return;
    }

    const request = {
      cuestionarioId: this.asignacionCuestionarioId,
      candidatoIds: this.selectedCandidatos.map(c => c.id),
      disponibleDesde: this.disponibleDesde.toISOString().slice(0, 19),
      disponibleHasta: this.disponibleHasta.toISOString().slice(0, 19)
    };

    this.asignacionService.crearBatch(request).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Asignado', detail: `${res.length} asignacion(es) creada(s)` });
        this.selectedCandidatos = [];
        this.disponibleDesde = null;
        this.disponibleHasta = null;
        this.loadAsignaciones(this.asignacionCuestionarioId!);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo asignar' })
    });
  }

  eliminarAsignacion(a: AsignacionResponse): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la asignacion de "${a.candidatoNombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.asignacionService.eliminar(a.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Asignacion eliminada' });
            this.loadAsignaciones(this.asignacionCuestionarioId!);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }
}
