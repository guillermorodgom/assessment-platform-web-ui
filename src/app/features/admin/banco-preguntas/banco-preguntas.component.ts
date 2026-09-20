import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, MenuItem } from 'primeng/api';
import { PreguntaHttpService } from '../../../core/services/pregunta-http.service';
import { PreguntaResponse } from '../../../core/models';
import { TipoPregunta } from '../../../core/models/enums.model';

@Component({
  selector: 'app-banco-preguntas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, ToolbarModule, ButtonModule,
    InputTextModule, TagModule, ChipModule, TooltipModule, ToastModule, OverlayPanelModule, BreadcrumbModule
  ],
  providers: [MessageService],
  templateUrl: './banco-preguntas.component.html'
})
export class BancoPreguntasComponent implements OnInit {
  @ViewChild('langOverlay') langOverlay!: OverlayPanel;
  preguntas: PreguntaResponse[] = [];
  filteredPreguntas: PreguntaResponse[] = [];
  loading = true;
  searchText = '';
  selectedLenguajes: string[] = [];

  breadcrumbItems: MenuItem[] = [
    { label: 'Dashboard', routerLink: '/admin' },
    { label: 'Banco de Preguntas' }
  ];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor(
    private preguntaService: PreguntaHttpService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPreguntas();
  }

  loadPreguntas(): void {
    this.loading = true;
    this.preguntaService.getAll().subscribe({
      next: data => {
        this.preguntas = data;
        this.onSearch();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las preguntas' });
      }
    });
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredPreguntas = [...this.preguntas];
      return;
    }
    const term = this.searchText.toLowerCase();
    this.filteredPreguntas = this.preguntas.filter(p =>
      p.titulo.toLowerCase().includes(term) ||
      (p.cuestionarios && p.cuestionarios.some(c => c.nombre.toLowerCase().includes(term)))
    );
  }

  showLenguajes(event: Event, lenguajes: string[]): void {
    this.selectedLenguajes = lenguajes;
    this.langOverlay.toggle(event);
  }

  navigateToCuestionario(p: PreguntaResponse): void {
    if (p.cuestionarios && p.cuestionarios.length > 0) {
      this.router.navigate(['/admin/cuestionarios', p.cuestionarios[0].id, 'preguntas']);
    }
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
