import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CuestionarioHttpService } from '../../core/services/cuestionario-http.service';
import { CuestionarioResponse } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, DividerModule, ButtonModule],
  template: `
    <div class="p-4">
      <h2 class="mt-0 mb-4" style="color: #e4e4e7">Dashboard Administrador</h2>

      <div class="grid">
        <div class="col-12 md:col-4">
          <p-card>
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-round"
                   style="width: 3rem; height: 3rem; background: var(--primary-color)">
                <i class="pi pi-list text-white text-xl"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Total cuestionarios</div>
                <div class="text-2xl font-bold" style="color: #e4e4e7">{{ cuestionarios.length }}</div>
              </div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-4">
          <p-card>
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-round"
                   style="width: 3rem; height: 3rem; background: var(--green-500)">
                <i class="pi pi-check-circle text-white text-xl"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Activos</div>
                <div class="text-2xl font-bold" style="color: #e4e4e7">{{ activos }}</div>
              </div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-4">
          <p-card>
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-round"
                   style="width: 3rem; height: 3rem; background: var(--orange-500)">
                <i class="pi pi-question-circle text-white text-xl"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Total preguntas</div>
                <div class="text-2xl font-bold" style="color: #e4e4e7">{{ totalPreguntas }}</div>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <p-divider></p-divider>

      <div class="grid">
        <div class="col-12 md:col-6">
          <p-card header="Gestion de Cuestionarios" subheader="Crear, editar y administrar evaluaciones">
            <p class="text-500">Administra los cuestionarios, configura tiempos limite y activa o desactiva evaluaciones.</p>
            <ng-template pTemplate="footer">
              <p-button label="Ir a Cuestionarios" icon="pi pi-arrow-right" routerLink="/admin/cuestionarios" [text]="true"></p-button>
            </ng-template>
          </p-card>
        </div>
        <div class="col-12 md:col-6">
          <p-card header="Banco de Preguntas" subheader="Preguntas de codigo y opciones multiples">
            <p class="text-500">Visualiza todas las preguntas del sistema en un solo lugar. Filtra por titulo, tipo o cuestionario.</p>
            <ng-template pTemplate="footer">
              <p-button label="Ir al Banco de Preguntas" icon="pi pi-arrow-right" routerLink="/admin/banco-preguntas" [text]="true"></p-button>
            </ng-template>
          </p-card>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  cuestionarios: CuestionarioResponse[] = [];
  activos = 0;
  totalPreguntas = 0;

  constructor(private cuestionarioService: CuestionarioHttpService) {}

  ngOnInit(): void {
    this.cuestionarioService.getAll().subscribe(data => {
      this.cuestionarios = data;
      this.activos = data.filter(c => c.activo).length;
      this.totalPreguntas = data.reduce((sum, c) => sum + c.cantidadPreguntas, 0);
    });
  }
}
