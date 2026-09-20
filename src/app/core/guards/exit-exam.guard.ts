import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';

export interface CanLeaveExam {
  canLeave(): boolean;
}

export const exitExamGuard: CanDeactivateFn<CanLeaveExam> = (component) => {
  if (component.canLeave()) {
    return true;
  }

  const confirmationService = inject(ConfirmationService);

  return new Observable<boolean>(observer => {
    confirmationService.confirm({
      message: 'Si sales del examen, las respuestas no enviadas se perderan. ¿Seguro que quieres salir?',
      header: 'Abandonar examen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, salir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        observer.next(true);
        observer.complete();
      },
      reject: () => {
        observer.next(false);
        observer.complete();
      }
    });
  });
};
