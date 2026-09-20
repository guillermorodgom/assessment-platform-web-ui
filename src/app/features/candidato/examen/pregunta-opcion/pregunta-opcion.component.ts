import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IntentoHttpService } from '../../../../core/services/intento-http.service';
import { ExamStateService } from '../../../../core/services/exam-state.service';
import { PreguntaResponse } from '../../../../core/models';
import { TipoPregunta } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-pregunta-opcion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PanelModule, RadioButtonModule,
    CheckboxModule, ButtonModule, TagModule, ToastModule
  ],
  templateUrl: './pregunta-opcion.component.html'
})
export class PreguntaOpcionComponent implements OnInit, OnChanges {
  @Input() pregunta!: PreguntaResponse;
  @Input() intentoId!: number;

  selectedSingle: number | null = null;
  selectedMultiple: number[] = [];
  submitting = false;
  submitted = false;

  TipoPregunta = TipoPregunta;

  constructor(
    private intentoService: IntentoHttpService,
    private examState: ExamStateService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPreguntaState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pregunta'] && !changes['pregunta'].firstChange) {
      this.loadPreguntaState();
    }
  }

  private loadPreguntaState(): void {
    // Reset component state
    this.selectedSingle = null;
    this.selectedMultiple = [];
    this.submitting = false;
    this.submitted = false;

    const saved = this.examState.getAnswer(this.pregunta.id);
    if (saved) {
      if (saved.submitted) {
        this.submitted = true;
      }
      if (saved.opcionesSeleccionadas && saved.opcionesSeleccionadas.length > 0) {
        if (this.isUnica()) {
          this.selectedSingle = saved.opcionesSeleccionadas[0];
        } else {
          this.selectedMultiple = [...saved.opcionesSeleccionadas];
        }
      }
    }
  }

  isUnica(): boolean {
    return this.pregunta.tipoPregunta === TipoPregunta.OPCION_UNICA;
  }

  onSelectionChange(): void {
    const opciones = this.isUnica()
      ? (this.selectedSingle !== null ? [this.selectedSingle] : [])
      : this.selectedMultiple;

    this.examState.updateAnswer(this.pregunta.id, {
      opcionesSeleccionadas: opciones
    });
  }

  enviarRespuesta(): void {
    const opciones = this.isUnica()
      ? (this.selectedSingle !== null ? [this.selectedSingle] : [])
      : this.selectedMultiple;

    if (opciones.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Seleccion', detail: 'Selecciona al menos una opcion' });
      return;
    }

    this.submitting = true;
    this.intentoService.enviarRespuesta(this.intentoId, {
      preguntaId: this.pregunta.id,
      opcionesSeleccionadas: opciones
    }).subscribe({
      next: resultado => {
        this.submitting = false;
        this.submitted = true;
        this.examState.markSubmitted(this.pregunta.id, resultado);
        this.messageService.add({
          severity: 'success',
          summary: 'Respuesta enviada',
          detail: 'Tu respuesta ha sido guardada. Veras el resultado al finalizar.'
        });
      },
      error: () => {
        this.submitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la respuesta' });
      }
    });
  }
}
