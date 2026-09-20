import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateCuestionarioRequest,
  UpdateCuestionarioRequest,
  CuestionarioResponse
} from '../models/cuestionario.model';

@Injectable({ providedIn: 'root' })
export class CuestionarioHttpService {
  private readonly apiUrl = `${environment.mngrApiUrl}/cuestionarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CuestionarioResponse[]> {
    return this.http.get<CuestionarioResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<CuestionarioResponse> {
    return this.http.get<CuestionarioResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCuestionarioRequest): Observable<CuestionarioResponse> {
    return this.http.post<CuestionarioResponse>(this.apiUrl, request);
  }

  update(id: number, request: UpdateCuestionarioRequest): Observable<CuestionarioResponse> {
    return this.http.put<CuestionarioResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getActivos(): Observable<CuestionarioResponse[]> {
    return this.http.get<CuestionarioResponse[]>(`${this.apiUrl}/activos`);
  }
}
