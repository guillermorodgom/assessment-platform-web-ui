import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription, map, takeWhile } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';
import { PreguntaResponse, EnviarRespuestaRequest, RespuestaCandidatoResponse } from '../models';

export interface LocalAnswer {
  preguntaId: number;
  codigoFuente?: string;
  lenguaje?: string;
  opcionesSeleccionadas?: number[];
  submitted: boolean;
  resultado?: RespuestaCandidatoResponse;
}

export interface ExamState {
  intentoId: number;
  cuestionarioId: number;
  cuestionarioNombre: string;
  preguntas: PreguntaResponse[];
  answers: Map<number, LocalAnswer>;
  fechaInicio: string;
  tiempoLimiteMinutos: number;
}

@Injectable({ providedIn: 'root' })
export class ExamStateService implements OnDestroy {
  private readonly STORAGE_KEY_PREFIX = 'exam_state_';

  private stateSubject = new BehaviorSubject<ExamState | null>(null);
  state$ = this.stateSubject.asObservable();

  private secondsRemainingSubject = new BehaviorSubject<number>(0);
  secondsRemaining$ = this.secondsRemainingSubject.asObservable();

  private timerExpiredSubject = new BehaviorSubject<boolean>(false);
  timerExpired$ = this.timerExpiredSubject.asObservable();

  private timerSub?: Subscription;
  private finished = false;

  constructor(private storage: SecureStorageService) {}

  initExam(
    intentoId: number,
    cuestionarioId: number,
    cuestionarioNombre: string,
    preguntas: PreguntaResponse[],
    fechaInicio: string,
    tiempoLimiteMinutos: number
  ): void {
    this.finished = false;
    this.timerExpiredSubject.next(false);

    const restored = this.restoreFromStorage(intentoId);
    const answers = restored ?? new Map<number, LocalAnswer>();

    if (!restored) {
      preguntas.forEach(p => {
        answers.set(p.id, {
          preguntaId: p.id,
          submitted: false
        });
      });
    }

    const state: ExamState = {
      intentoId,
      cuestionarioId,
      cuestionarioNombre,
      preguntas,
      answers,
      fechaInicio,
      tiempoLimiteMinutos
    };

    this.stateSubject.next(state);
    this.startTimer(fechaInicio, tiempoLimiteMinutos);
    this.saveToStorage();
  }

  getAnswer(preguntaId: number): LocalAnswer | undefined {
    return this.stateSubject.value?.answers.get(preguntaId);
  }

  updateAnswer(preguntaId: number, partial: Partial<LocalAnswer>): void {
    const state = this.stateSubject.value;
    if (!state) return;

    const existing = state.answers.get(preguntaId) || { preguntaId, submitted: false };
    state.answers.set(preguntaId, { ...existing, ...partial });
    this.stateSubject.next(state);
    this.saveToStorage();
  }

  markSubmitted(preguntaId: number, resultado: RespuestaCandidatoResponse): void {
    this.updateAnswer(preguntaId, { submitted: true, resultado });
  }

  getSubmittedCount(): number {
    const state = this.stateSubject.value;
    if (!state) return 0;
    let count = 0;
    state.answers.forEach(a => { if (a.submitted) count++; });
    return count;
  }

  finishExam(): void {
    this.finished = true;
    this.timerSub?.unsubscribe();
    const state = this.stateSubject.value;
    if (state) {
      this.storage.removeItem(this.STORAGE_KEY_PREFIX + state.intentoId);
    }
    this.stateSubject.next(null);
  }

  isFinished(): boolean {
    return this.finished;
  }

  private startTimer(fechaInicio: string, tiempoLimiteMinutos: number): void {
    this.timerSub?.unsubscribe();

    // Forzar interpretación UTC: el backend envía LocalDateTime sin zona horaria,
    // pero el servidor (ECS) corre en UTC. Sin la 'Z', JavaScript lo parsea como hora local del browser.
    const normalized = fechaInicio.endsWith('Z') ? fechaInicio : fechaInicio + 'Z';
    const startMs = new Date(normalized).getTime();
    const totalMs = tiempoLimiteMinutos * 60 * 1000;
    const elapsedMs = Date.now() - startMs;
    let remaining = Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));

    this.secondsRemainingSubject.next(remaining);

    this.timerSub = interval(1000).pipe(
      map(() => --remaining),
      takeWhile(s => s >= 0, true)
    ).subscribe(seconds => {
      this.secondsRemainingSubject.next(Math.max(0, seconds));
      if (seconds <= 0) {
        this.timerExpiredSubject.next(true);
      }
    });
  }

  private saveToStorage(): void {
    const state = this.stateSubject.value;
    if (!state) return;

    const serializable = {
      answers: Array.from(state.answers.entries())
    };
    this.storage.setItem(
      this.STORAGE_KEY_PREFIX + state.intentoId,
      JSON.stringify(serializable)
    );
  }

  private restoreFromStorage(intentoId: number): Map<number, LocalAnswer> | null {
    const stored = this.storage.getItem(this.STORAGE_KEY_PREFIX + intentoId);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return new Map<number, LocalAnswer>(parsed.answers);
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }
}
