import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { examGuard } from './core/guards/exam.guard';
import { resultadoGuard } from './core/guards/resultado.guard';
import { exitExamGuard } from './core/guards/exit-exam.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  // Examen: pantalla completa, sin layout sidebar
  {
    path: 'assessments/examen/:intentoId',
    loadComponent: () => import('./features/candidato/examen/examen.component').then(m => m.ExamenComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'CANDIDATO' },
    canDeactivate: [exitExamGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Admin routes
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'cuestionarios',
            loadComponent: () => import('./features/admin/cuestionario-list/cuestionario-list.component').then(m => m.CuestionarioListComponent)
          },
          {
            path: 'cuestionarios/:id/preguntas',
            loadComponent: () => import('./features/admin/pregunta-list/pregunta-list.component').then(m => m.PreguntaListComponent)
          },
          {
            path: 'banco-preguntas',
            loadComponent: () => import('./features/admin/banco-preguntas/banco-preguntas.component').then(m => m.BancoPreguntasComponent)
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./features/admin/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
          }
        ]
      },
      // Candidato routes
      {
        path: 'assessments',
        canActivate: [roleGuard],
        data: { role: 'CANDIDATO' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/candidato/candidato-dashboard.component').then(m => m.CandidatoDashboardComponent)
          },
          {
            path: 'resultado/:intentoId',
            loadComponent: () => import('./features/candidato/resultado/resultado.component').then(m => m.ResultadoComponent),
            canActivate: [resultadoGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
