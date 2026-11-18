import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para páginas públicas como /login.
 * Si el usuario ya cuenta con una sesión JWT válida, lo redirige al panel principal.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigate(['/trazabilidad/inicio']);
    return false;
  }

  return true;
};
