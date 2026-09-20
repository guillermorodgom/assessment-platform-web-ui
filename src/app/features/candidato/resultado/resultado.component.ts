import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { KnobModule } from 'primeng/knob';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { IntentoHttpService } from '../../../core/services/intento-http.service';
import { ResultadoIntentoResponse, RespuestaCandidatoResponse, PreguntaResponse } from '../../../core/models';
import { TipoPregunta } from '../../../core/models/enums.model';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [
    CommonModule, FormsModule, KnobModule, AccordionModule, TagModule,
    PanelModule, FieldsetModule, DividerModule, ChipModule, ButtonModule
  ],
  templateUrl: './resultado.component.html'
})
export class ResultadoComponent implements OnInit {
  resultado?: ResultadoIntentoResponse;
  preguntas: PreguntaResponse[] = [];
  loading = true;

  puntajePorcentaje = 0;
  puntajeMaximo = 0;
  correctas = 0;
  incorrectas = 0;

  TipoPregunta = TipoPregunta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private intentoService: IntentoHttpService
  ) {}

  ngOnInit(): void {
    const intentoId = Number(this.route.snapshot.paramMap.get('intentoId'));

    this.intentoService.getResultado(intentoId).subscribe({
      next: resultado => {
        this.resultado = resultado;

        this.intentoService.getPreguntasByIntento(intentoId).subscribe(preguntas => {
          this.preguntas = preguntas;
          this.calcularEstadisticas(resultado, preguntas);
          this.loading = false;
        });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/assessments']);
      }
    });
  }

  private calcularEstadisticas(resultado: ResultadoIntentoResponse, preguntas: PreguntaResponse[]): void {
    this.puntajeMaximo = resultado.puntajeMaximo || preguntas.reduce((sum, p) => sum + p.puntaje, 0);
    this.puntajePorcentaje = this.puntajeMaximo > 0
      ? Math.round((resultado.puntajeTotal / this.puntajeMaximo) * 100)
      : 0;
    this.correctas = (resultado.respuestas || []).filter(r => r.esCorrecta).length;
    this.incorrectas = (resultado.respuestas || []).filter(r => !r.esCorrecta).length;
  }

  getRespuesta(preguntaId: number): RespuestaCandidatoResponse | undefined {
    return this.resultado?.respuestas?.find(r => r.preguntaId === preguntaId);
  }

  getPregunta(preguntaId: number): PreguntaResponse | undefined {
    return this.preguntas.find(p => p.id === preguntaId);
  }

  getPreguntaTipo(preguntaId: number): TipoPregunta | undefined {
    return this.preguntas.find(p => p.id === preguntaId)?.tipoPregunta;
  }

  getOpcionTexto(preguntaId: number, opcionId: number): string {
    const pregunta = this.preguntas.find(p => p.id === preguntaId);
    const opcion = pregunta?.opciones?.find(o => o.id === opcionId);
    return opcion?.texto || `Opcion #${opcionId}`;
  }

  isOpcionCorrecta(preguntaId: number, opcionId: number): boolean {
    const pregunta = this.preguntas.find(p => p.id === preguntaId);
    const opcion = pregunta?.opciones?.find(o => o.id === opcionId);
    return opcion?.esCorrecta || false;
  }

  volver(): void {
    this.router.navigate(['/assessments']);
  }
}
