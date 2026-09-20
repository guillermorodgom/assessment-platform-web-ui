import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { IntentoHttpService } from '../services/intento-http.service';
import { IdObfuscationService } from '../services/id-obfuscation.service';
import { EstadoIntento } from '../models/enums.model';

export const resultadoGuard: CanActivateFn = (route) => {
  const intentoService = inject(IntentoHttpService);
  const router = inject(Router);
  const idObfuscation = inject(IdObfuscationService);
  const intentoId = idObfuscation.decode(route.paramMap.get('intentoId') || '');

  if (!intentoId) {
    router.navigate(['/assessments']);
    return false;
  }

  return intentoService.getResultado(intentoId).pipe(
    map(intento => {
      if (intento.estado === EstadoIntento.FINALIZADO) {
        return true;
      }
      router.navigate(['/assessments']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/assessments']);
      return of(false);
    })
  );
};
