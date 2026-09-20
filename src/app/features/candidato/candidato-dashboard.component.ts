import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { NgIconComponent } from '@ng-icons/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IntentoHttpService } from '../../core/services/intento-http.service';
import { AsignacionHttpService } from '../../core/services/asignacion-http.service';
import { IdObfuscationService } from '../../core/services/id-obfuscation.service';
import { AsignacionResponse, IntentoExamenResponse } from '../../core/models';
import { EstadoIntento } from '../../core/models/enums.model';

@Component({
  selector: 'app-candidato-dashboard',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, TagModule, ChipModule,
    DividerModule, ProgressBarModule, ConfirmDialogModule, DialogModule,
    ToastModule, DataViewModule, TableModule, NgIconComponent
  ],
  templateUrl: './candidato-dashboard.component.html',
  styleUrl: './candidato-dashboard.component.scss'
})
export class CandidatoDashboardComponent implements OnInit {
  asignaciones: AsignacionResponse[] = [];
  intentos: IntentoExamenResponse[] = [];
  loadingAsignaciones = true;
  loadingIntentos = true;

  constructor(
    private asignacionService: AsignacionHttpService,
    private intentoService: IntentoHttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private idObfuscation: IdObfuscationService
  ) {}

  ngOnInit(): void {
    this.asignacionService.getMisAsignaciones().subscribe({
      next: data => {
        this.asignaciones = data;
        this.loadingAsignaciones = false;
      },
      error: () => this.loadingAsignaciones = false
    });

    this.intentoService.getMisIntentos().subscribe({
      next: data => {
        this.intentos = data;
        this.loadingIntentos = false;
      },
      error: () => this.loadingIntentos = false
    });
  }

  // Iniciar evaluacion dialog
  iniciarDialogVisible = false;
  iniciarAsignacion: AsignacionResponse | null = null;
  iniciando = false;

  iniciarEvaluacion(a: AsignacionResponse): void {
    this.iniciarAsignacion = a;
    this.iniciarDialogVisible = true;
  }

  confirmarInicio(): void {
    if (!this.iniciarAsignacion || this.iniciando) return;
    this.iniciando = true;
    this.intentoService.iniciar({ cuestionarioId: this.iniciarAsignacion.cuestionarioId }).subscribe({
      next: intento => {
        this.iniciando = false;
        this.iniciarDialogVisible = false;
        this.router.navigate(['/assessments/examen', this.idObfuscation.encode(intento.id)]);
      },
      error: () => {
        this.iniciando = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo iniciar la evaluacion' });
      }
    });
  }

  continuarExamen(intento: IntentoExamenResponse): void {
    this.router.navigate(['/assessments/examen', this.idObfuscation.encode(intento.id)]);
  }

  verResultado(intento: IntentoExamenResponse): void {
    this.router.navigate(['/assessments/resultado', this.idObfuscation.encode(intento.id)]);
  }

  getEstadoSeverity(estado: EstadoIntento): 'warning' | 'success' | 'danger' | 'info' {
    switch (estado) {
      case EstadoIntento.EN_PROGRESO: return 'warning';
      case EstadoIntento.FINALIZADO: return 'success';
      default: return 'danger';
    }
  }

  getEstadoLabel(estado: EstadoIntento): string {
    switch (estado) {
      case EstadoIntento.EN_PROGRESO: return 'En Progreso';
      case EstadoIntento.FINALIZADO: return 'Finalizado';
      case EstadoIntento.ABANDONADO: return 'Abandonado';
      default: return estado;
    }
  }

  getAsignacionSeverity(estado: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (estado) {
      case 'ACTIVA': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'EXPIRADA': return 'danger';
      case 'INACTIVA': return 'info';
      default: return 'info';
    }
  }

  getAsignacionLabel(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'Activa';
      case 'PENDIENTE': return 'Pendiente';
      case 'EXPIRADA': return 'Expirada';
      case 'INACTIVA': return 'Inactiva';
      default: return estado;
    }
  }

  isActiva(a: AsignacionResponse): boolean {
    return a.estado === 'ACTIVA';
  }

  tieneIntentosDisponibles(a: AsignacionResponse): boolean {
    return a.intentosUsados < a.maxIntentos;
  }

  getIntentoEnProgreso(cuestionarioId: number): IntentoExamenResponse | undefined {
    return this.intentos.find(i => i.cuestionarioId === cuestionarioId && i.estado === EstadoIntento.EN_PROGRESO);
  }

  puedeIniciar(a: AsignacionResponse): boolean {
    return this.isActiva(a) && this.tieneIntentosDisponibles(a) && !this.getIntentoEnProgreso(a.cuestionarioId);
  }

  getIntentosLabel(a: AsignacionResponse): string {
    const restantes = a.maxIntentos - a.intentosUsados;
    return `${restantes} de ${a.maxIntentos}`;
  }

  getActivasCount(): number {
    return this.asignaciones.filter(a => this.isActiva(a) && this.tieneIntentosDisponibles(a)).length;
  }

  getEnProgresoCount(): number {
    return this.intentos.filter(i => i.estado === EstadoIntento.EN_PROGRESO).length;
  }

  getFinalizadosCount(): number {
    return this.intentos.filter(i => i.estado === EstadoIntento.FINALIZADO).length;
  }
}
