import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, MenuItem } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsuarioHttpService } from '../../../core/services/usuario-http.service';
import { IntentoHttpService } from '../../../core/services/intento-http.service';
import { CandidatoConUltimoIntento, IntentoExamenResponse, UsuarioResponse } from '../../../core/models';

@Component({
  selector: 'app-candidato-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule,
    TagModule, TooltipModule, ToastModule, BreadcrumbModule, InputTextModule
  ],
  templateUrl: './candidato-list.component.html',
  styleUrl: './candidato-list.component.scss',
  providers: [MessageService]
})
export class CandidatoListComponent implements OnInit {
  candidatos: CandidatoConUltimoIntento[] = [];
  loading = true;
  searchValue = '';

  @ViewChild('dt') dt!: Table;

  breadcrumbItems: MenuItem[] = [
    { label: 'Dashboard', routerLink: '/admin' },
    { label: 'Evaluados' }
  ];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor(
    private usuarioService: UsuarioHttpService,
    private intentoService: IntentoHttpService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCandidatos();
  }

  loadCandidatos(): void {
    this.loading = true;
    this.usuarioService.getCandidatos().subscribe({
      next: usuarios => {
        this.loadIntentosPorCandidato(usuarios);
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los evaluados.'
        });
      }
    });
  }

  private loadIntentosPorCandidato(usuarios: UsuarioResponse[]): void {
    const requests = usuarios.map(usuario =>
      this.intentoService.getIntentosByCandidato(usuario.id).pipe(
        map(intentos => ({
          ...usuario,
          ultimoIntento: intentos.length > 0 ? intentos[0] : null
        } as CandidatoConUltimoIntento)),
        catchError(() => of({
          ...usuario,
          ultimoIntento: null
        } as CandidatoConUltimoIntento))
      )
    );

    if (requests.length === 0) {
      this.candidatos = [];
      this.loading = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: data => {
        this.candidatos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los intentos de los evaluados.'
        });
      }
    });
  }

  onFilter(event: Event): void {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dt.filterGlobal('', 'contains');
  }

  verEvaluaciones(candidato: CandidatoConUltimoIntento): void {
    this.router.navigate(['/admin/candidatos', candidato.id, 'evaluaciones']);
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
}
