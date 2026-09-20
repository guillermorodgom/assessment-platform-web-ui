import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, MenuItem } from 'primeng/api';
import { IntentoHttpService } from '../../../core/services/intento-http.service';
import { UsuarioHttpService } from '../../../core/services/usuario-http.service';
import { IntentoExamenResponse, ResultadoIntentoResponse, UsuarioResponse } from '../../../core/models';

@Component({
  selector: 'app-candidato-evaluaciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule,
    TagModule, TooltipModule, ToastModule, BreadcrumbModule,
    DialogModule, DividerModule, ProgressSpinnerModule, InputTextModule
  ],
  templateUrl: './candidato-evaluaciones.component.html',
  styleUrl: './candidato-evaluaciones.component.scss',
  providers: [MessageService]
})
export class CandidatoEvaluacionesComponent implements OnInit {
  candidatoId: number = 0;
  candidato: UsuarioResponse | null = null;
  intentos: IntentoExamenResponse[] = [];
  loading = true;
  searchValue = '';

  @ViewChild('dt') dt!: Table;

  detalleDialogVisible = false;
  detalleIntento: ResultadoIntentoResponse | null = null;
  detalleLoading = false;

  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor(
    private route: ActivatedRoute,
    private intentoService: IntentoHttpService,
    private usuarioService: UsuarioHttpService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.candidatoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.candidatoId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de evaluado invalido'
      });
      return;
    }
    this.loadCandidato();
    this.loadIntentos();
  }

  loadIntentos(): void {
    this.loading = true;
    this.intentoService.getIntentosByCandidato(this.candidatoId).subscribe({
      next: data => {
        this.intentos = data.sort((a, b) => {
          const dateA = new Date(a.fechaInicio).getTime();
          const dateB = new Date(b.fechaInicio).getTime();
          return dateB - dateA;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las evaluaciones'
        });
      }
    });
  }

  private loadCandidato(): void {
    this.usuarioService.getAll().subscribe({
      next: usuarios => {
        this.candidato = usuarios.find(u => u.id === this.candidatoId) || null;
        this.updateBreadcrumb();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la informacion del evaluado'
        });
      }
    });
  }

  private updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/admin' },
      { label: 'Evaluados', routerLink: '/admin/candidatos' },
      { label: this.candidato?.nombreCompleto || 'Evaluado' }
    ];
  }

  onFilter(event: Event): void {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dt.filterGlobal('', 'contains');
  }

  verDetalle(intento: IntentoExamenResponse): void {
    if (intento.estado !== 'FINALIZADO') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validacion',
        detail: 'Solo se pueden ver los detalles de intentos finalizados'
      });
      return;
    }

    this.detalleLoading = true;
    this.detalleDialogVisible = true;
    this.intentoService.getResultado(intento.id).subscribe({
      next: resultado => {
        this.detalleIntento = resultado;
        this.detalleLoading = false;
      },
      error: () => {
        this.detalleLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del intento'
        });
      }
    });
  }

  getSeverity(estado: string): 'success' | 'warning' | 'danger' {
    switch (estado) {
      case 'FINALIZADO':
        return 'success';
      case 'EN_PROGRESO':
        return 'warning';
      case 'ABANDONADO':
        return 'danger';
      default:
        return 'warning';
    }
  }

  formatTiempo(segundos: number): string {
    if (!segundos) return '-';
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min} min ${seg.toString().padStart(2, '0')} seg`;
  }

  getResultadoSeverity(esCorrecta: boolean): 'success' | 'danger' {
    return esCorrecta ? 'success' : 'danger';
  }

  closeDetalleDialog(): void {
    this.detalleDialogVisible = false;
    this.detalleIntento = null;
  }
}
