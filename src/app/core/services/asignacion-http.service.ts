import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateAsignacionRequest,
  AsignacionBatchRequest,
  AsignacionResponse,
  UsuarioSimpleResponse
} from '../models/asignacion.model';

@Injectable({ providedIn: 'root' })
export class AsignacionHttpService {
  private readonly apiUrl = `${environment.mngrApiUrl}/asignaciones`;
  private readonly usuariosUrl = `${environment.mngrApiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  crear(request: CreateAsignacionRequest): Observable<AsignacionResponse> {
    return this.http.post<AsignacionResponse>(this.apiUrl, request);
  }

  crearBatch(request: AsignacionBatchRequest): Observable<AsignacionResponse[]> {
    return this.http.post<AsignacionResponse[]>(`${this.apiUrl}/batch`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByCuestionario(cuestionarioId: number): Observable<AsignacionResponse[]> {
    return this.http.get<AsignacionResponse[]>(`${this.apiUrl}/cuestionario/${cuestionarioId}`);
  }

  getMisAsignaciones(): Observable<AsignacionResponse[]> {
    return this.http.get<AsignacionResponse[]>(`${this.apiUrl}/mis-asignaciones`);
  }

  getCandidatos(): Observable<UsuarioSimpleResponse[]> {
    return this.http.get<UsuarioSimpleResponse[]>(`${this.usuariosUrl}/candidatos`);
  }
}
