import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompilerRequest, CompilerResponse } from '../models/compiler.model';

@Injectable({ providedIn: 'root' })
export class CompilerHttpService {
  private readonly apiUrl = `${environment.compilerApiUrl}/compiler`;

  constructor(private http: HttpClient) {}

  execute(request: CompilerRequest): Observable<CompilerResponse> {
    return this.http.post<CompilerResponse>(`${this.apiUrl}/execute`, request);
  }

  run(request: { sourceCode: string; language: string; stdin?: string }): Observable<{ output: string; error: string }> {
    return this.http.post<{ output: string; error: string }>(`${this.apiUrl}/run`, request);
  }
}
