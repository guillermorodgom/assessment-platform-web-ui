import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IniciarIntentoRequest,
  EnviarRespuestaRequest,
  IntentoExamenResponse,
  ResultadoIntentoResponse,
  RespuestaCandidatoResponse
} from '../models/intento.model';
import { PreguntaResponse } from '../models/pregunta.model';

@Injectable({ providedIn: 'root' })
export class IntentoHttpService {
  private readonly apiUrl = `${environment.mngrApiUrl}/intentos`;

  constructor(private http: HttpClient) {}

  iniciar(request: IniciarIntentoRequest): Observable<IntentoExamenResponse> {
    return this.http.post<IntentoExamenResponse>(this.apiUrl, request);
  }

  enviarRespuesta(intentoId: number, request: EnviarRespuestaRequest): Observable<RespuestaCandidatoResponse> {
    return this.http.post<RespuestaCandidatoResponse>(`${this.apiUrl}/${intentoId}/respuestas`, request);
  }

  finalizar(intentoId: number): Observable<IntentoExamenResponse> {
    return this.http.post<IntentoExamenResponse>(`${this.apiUrl}/${intentoId}/finalizar`, {});
  }

  abandonar(intentoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${intentoId}/abandonar`, {});
  }

  getMisIntentos(): Observable<IntentoExamenResponse[]> {
    return this.http.get<IntentoExamenResponse[]>(`${this.apiUrl}/mis-intentos`);
  }

  getResultado(intentoId: number): Observable<ResultadoIntentoResponse> {
    return this.http.get<ResultadoIntentoResponse>(`${this.apiUrl}/${intentoId}/resultado`);
  }

  getPreguntasByIntento(intentoId: number): Observable<PreguntaResponse[]> {
    return this.http.get<PreguntaResponse[]>(`${this.apiUrl}/${intentoId}/preguntas`);
  }

  getIntentosByCandidato(candidatoId: number): Observable<IntentoExamenResponse[]> {
    return this.http.get<IntentoExamenResponse[]>(`${this.apiUrl}/candidato/${candidatoId}`);
  }
}
