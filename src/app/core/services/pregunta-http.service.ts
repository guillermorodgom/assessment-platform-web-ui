import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePreguntaRequest,
  UpdatePreguntaRequest,
  PreguntaResponse,
  CreateOpcionRequest,
  OpcionRespuestaResponse,
  CreateCasoDePruebaRequest,
  CasoDePruebaResponse
} from '../models/pregunta.model';

@Injectable({ providedIn: 'root' })
export class PreguntaHttpService {
  private readonly apiUrl = `${environment.mngrApiUrl}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PreguntaResponse[]> {
    return this.http.get<PreguntaResponse[]>(`${this.apiUrl}/preguntas`);
  }

  duplicar(preguntaId: number, cuestionarioId: number): Observable<PreguntaResponse> {
    return this.http.post<PreguntaResponse>(
      `${this.apiUrl}/preguntas/${preguntaId}/duplicar?cuestionarioId=${cuestionarioId}`, {}
    );
  }

  asociar(preguntaId: number, cuestionarioId: number): Observable<PreguntaResponse> {
    return this.http.post<PreguntaResponse>(
      `${this.apiUrl}/cuestionarios/${cuestionarioId}/preguntas/${preguntaId}/asociar`, {}
    );
  }

  desvincular(preguntaId: number, cuestionarioId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/cuestionarios/${cuestionarioId}/preguntas/${preguntaId}`
    );
  }

  getByCuestionario(cuestionarioId: number): Observable<PreguntaResponse[]> {
    return this.http.get<PreguntaResponse[]>(`${this.apiUrl}/cuestionarios/${cuestionarioId}/preguntas`);
  }

  getById(preguntaId: number): Observable<PreguntaResponse> {
    return this.http.get<PreguntaResponse>(`${this.apiUrl}/preguntas/${preguntaId}`);
  }

  create(cuestionarioId: number, request: CreatePreguntaRequest): Observable<PreguntaResponse> {
    return this.http.post<PreguntaResponse>(`${this.apiUrl}/cuestionarios/${cuestionarioId}/preguntas`, request);
  }

  update(preguntaId: number, request: UpdatePreguntaRequest): Observable<PreguntaResponse> {
    return this.http.put<PreguntaResponse>(`${this.apiUrl}/preguntas/${preguntaId}`, request);
  }

  delete(preguntaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/preguntas/${preguntaId}`);
  }

  addOpcion(preguntaId: number, request: CreateOpcionRequest): Observable<OpcionRespuestaResponse> {
    return this.http.post<OpcionRespuestaResponse>(`${this.apiUrl}/preguntas/${preguntaId}/opciones`, request);
  }

  deleteOpcion(opcionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/opciones/${opcionId}`);
  }

  addCasoDePrueba(preguntaId: number, request: CreateCasoDePruebaRequest): Observable<CasoDePruebaResponse> {
    return this.http.post<CasoDePruebaResponse>(`${this.apiUrl}/preguntas/${preguntaId}/casos-de-prueba`, request);
  }

  deleteCasoDePrueba(casoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/casos-de-prueba/${casoId}`);
  }
}
