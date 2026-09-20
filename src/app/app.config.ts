import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { provideNgIconsConfig, provideIcons } from '@ng-icons/core';
import {
  heroXMark, heroCheck, heroPlus, heroLink,
  heroTrash, heroExclamationTriangle, heroPlay
} from '@ng-icons/heroicons/outline';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideAnimations(),
    MessageService,
    ConfirmationService,
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: {
        baseUrl: '/assets'
      }
    },
    provideIcons({ heroXMark, heroCheck, heroPlus, heroLink, heroTrash, heroExclamationTriangle, heroPlay }),
    provideNgIconsConfig({ size: '1.25rem' })
  ]
};
