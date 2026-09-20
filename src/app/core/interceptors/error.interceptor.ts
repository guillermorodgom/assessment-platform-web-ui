import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
      } else if (error.status === 403) {
        messageService.add({
          severity: 'warn',
          summary: 'Acceso denegado',
          detail: 'No tienes permisos para realizar esta acción'
        });
      } else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'Error del servidor',
          detail: error.error?.message || 'Error interno del servidor'
        });
      }
      console.error(`[HTTP ERROR] ${error.status} — ${error.url}`, error.message);
      return throwError(() => error);
    })
  );
};
