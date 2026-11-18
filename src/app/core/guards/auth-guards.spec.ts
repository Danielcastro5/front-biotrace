import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';

describe('Guards de navegación (authGuard y guestGuard)', () => {
  it('authGuard permite acceso si el usuario está autenticado', () => {
    const auth = { isAuthenticated: vi.fn(() => true) };
    const router = { navigate: vi.fn() };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = runInInjectionContext(injector, () => authGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('authGuard redirige a /login si el usuario no está autenticado', () => {
    const auth = { isAuthenticated: vi.fn(() => false) };
    const router = { navigate: vi.fn() };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = runInInjectionContext(injector, () => authGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('guestGuard permite acceso a /login si el usuario NO está autenticado', () => {
    const auth = { isAuthenticated: vi.fn(() => false) };
    const router = { navigate: vi.fn() };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = runInInjectionContext(injector, () => guestGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('guestGuard redirige a /trazabilidad/inicio si el usuario ya está autenticado', () => {
    const auth = { isAuthenticated: vi.fn(() => true) };
    const router = { navigate: vi.fn() };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = runInInjectionContext(injector, () => guestGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/trazabilidad/inicio']);
  });
});
