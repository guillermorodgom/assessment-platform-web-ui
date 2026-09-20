import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  if (!requiredRole) return true;

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  // Redirect to appropriate dashboard based on actual role
  const roles = authService.getUserRoles();
  if (roles.includes('ADMIN')) {
    router.navigate(['/admin']);
  } else if (roles.includes('CANDIDATO')) {
    router.navigate(['/assessments']);
  } else {
    router.navigate(['/auth/login']);
  }

  return false;
};
