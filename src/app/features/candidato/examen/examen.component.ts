import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListboxModule } from 'primeng/listbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IntentoHttpService } from '../../../core/services/intento-http.service';
import { CuestionarioHttpService } from '../../../core/services/cuestionario-http.service';
import { ExamStateService } from '../../../core/services/exam-state.service';
import { CanLeaveExam } from '../../../core/guards/exit-exam.guard';
import { PreguntaResponse, IntentoExamenResponse } from '../../../core/models';
import { TipoPregunta } from '../../../core/models/enums.model';
import { PreguntaCodigoComponent } from './pregunta-codigo/pregunta-codigo.component';
import { PreguntaOpcionComponent } from './pregunta-opcion/pregunta-opcion.component';

@Component({
  selector: 'app-examen',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ListboxModule, ProgressBarModule,
    TagModule, ButtonModule, ConfirmDialogModule, ToastModule, TooltipModule,
    PreguntaCodigoComponent, PreguntaOpcionComponent
  ],
  templateUrl: './examen.component.html',
  styleUrl: './examen.component.scss'
})
export class ExamenComponent implements OnInit, OnDestroy, CanLeaveExam {
  intentoId!: number;
  intento?: IntentoExamenResponse;
  preguntas: PreguntaResponse[] = [];
  currentPregunta?: PreguntaResponse;
  currentIndex = 0;

  secondsRemaining = 0;
  timerDisplay = '00:00';
  timerProgress = 100;
  totalSeconds = 0;

  loading = true;
  finalizing = false;
  sidebarCollapsed = false;

  private subs: Subscription[] = [];

  TipoPregunta = TipoPregunta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private intentoService: IntentoHttpService,
    private cuestionarioService: CuestionarioHttpService,
    public examState: ExamStateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.intentoId = Number(this.route.snapshot.paramMap.get('intentoId'));

    this.intentoService.getResultado(this.intentoId).subscribe({
      next: intento => {
        this.intento = intento;
        this.intentoService.getPreguntasByIntento(this.intentoId).subscribe({
          next: preguntas => {
            this.preguntas = preguntas;
            this.cuestionarioService.getById(intento.cuestionarioId).subscribe(c => {
              this.totalSeconds = c.tiempoLimite * 60;
              this.examState.initExam(
                this.intentoId,
                intento.cuestionarioId,
                intento.cuestionarioNombre,
                preguntas,
                intento.fechaInicio,
                c.tiempoLimite
              );

              // Restore already submitted answers from backend
              if (intento.respuestas) {
                intento.respuestas.forEach(r => {
                  this.examState.markSubmitted(r.preguntaId, r);
                });
              }

              this.selectPregunta(0);
              this.loading = false;

              this.subs.push(
                this.examState.secondsRemaining$.subscribe(s => {
                  this.secondsRemaining = s;
                  this.timerDisplay = this.formatTime(s);
                  this.timerProgress = this.totalSeconds > 0 ? (s / this.totalSeconds) * 100 : 0;
                })
              );

              this.subs.push(
                this.examState.timerExpired$.subscribe(expired => {
                  if (expired) {
                    this.messageService.add({ severity: 'warn', summary: 'Tiempo agotado', detail: 'El tiempo se ha agotado. Finalizando examen...' });
                    this.doFinalize();
                  }
                })
              );
            });
          },
          error: () => this.handleLoadError()
        });
      },
      error: () => this.handleLoadError()
    });
  }

  private handleLoadError(): void {
    this.loading = false;
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el examen' });
    this.router.navigate(['/assessments']);
  }

  selectPregunta(index: number): void {
    if (index >= 0 && index < this.preguntas.length) {
      this.currentIndex = index;
      this.currentPregunta = this.preguntas[index];
    }
  }

  nextPregunta(): void {
    if (this.currentIndex < this.preguntas.length - 1) {
      this.selectPregunta(this.currentIndex + 1);
    }
  }

  prevPregunta(): void {
    if (this.currentIndex > 0) {
      this.selectPregunta(this.currentIndex - 1);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  get isFirst(): boolean {
    return this.currentIndex === 0;
  }

  get isLast(): boolean {
    return this.currentIndex === this.preguntas.length - 1;
  }

  getPreguntaIcon(p: PreguntaResponse): string {
    return p.tipoPregunta === TipoPregunta.CODIGO ? 'pi pi-code' : 'pi pi-list';
  }

  getPreguntaStatus(p: PreguntaResponse): string {
    const answer = this.examState.getAnswer(p.id);
    if (answer?.submitted) return 'Enviada';
    if (answer?.codigoFuente || (answer?.opcionesSeleccionadas && answer.opcionesSeleccionadas.length > 0)) return 'Respondida';
    return 'Pendiente';
  }

  getPreguntaStatusSeverity(p: PreguntaResponse): 'success' | 'info' | 'danger' {
    const status = this.getPreguntaStatus(p);
    if (status === 'Enviada') return 'success';
    if (status === 'Respondida') return 'info';
    return 'danger';
  }

  confirmFinalize(): void {
    const submitted = this.examState.getSubmittedCount();
    const total = this.preguntas.length;
    const pending = total - submitted;
    const msg = pending > 0
      ? `Tienes ${pending} pregunta(s) sin enviar. ¿Finalizar de todas formas?`
      : '¿Finalizar la evaluacion? No podras modificar tus respuestas.';

    this.confirmationService.confirm({
      message: msg,
      header: 'Finalizar evaluacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Finalizar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.doFinalize()
    });
  }

  private doFinalize(): void {
    if (this.finalizing) return;
    this.finalizing = true;
    this.intentoService.finalizar(this.intentoId).subscribe({
      next: () => {
        this.examState.finishExam();
        this.router.navigate(['/assessments/resultado', this.intentoId]);
      },
      error: () => {
        this.finalizing = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo finalizar' });
      }
    });
  }

  canLeave(): boolean {
    return this.examState.isFinished() || this.finalizing;
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
