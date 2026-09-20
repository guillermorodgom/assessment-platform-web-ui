import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioResponse } from '../models/auth.model';
import { RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UsuarioHttpService {
  private readonly apiUrl = `${environment.mngrApiUrl}/usuarios`;
  private readonly authUrl = `${environment.authApiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl);
  }

  crear(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/register`, request);
  }

  getCandidatos(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.apiUrl}/candidatos`);
  }
}
