import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from './login.component';

function createLoginComponent(auth: Partial<AuthService>, router: Partial<Router>): LoginComponent {
  const injector = Injector.create({
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
    ],
  });

  return runInInjectionContext(injector, () => new LoginComponent());
}

describe('LoginComponent interactions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits entered credentials and navigates after a successful login', () => {
    const auth = {
      login: vi.fn(() => of(true)),
      loginReadOnly: vi.fn(() => of(true)),
      sessionNotice: signal(''),
    };
    const router = { navigate: vi.fn() };
    const component = createLoginComponent(auth, router);
    component.email = 'qa@example.com';
    component.password = ' secret ';

    component.handleLogin();

    expect(auth.login).toHaveBeenCalledWith('qa@example.com', 'secret');
    expect(router.navigate).toHaveBeenCalledWith(['/trazabilidad/inicio']);
    expect(component.isLoading()).toBe(false);
  });

  it('handles login errors properly when credentials fail', () => {
    const auth = {
      login: vi.fn(() => ({
        subscribe: ({ error }: { next: () => void; error: (err: { message: string }) => void }) => {
          error({ message: 'Credenciales inválidas' });
        }
      })),
      loginReadOnly: vi.fn(() => of(true)),
      sessionNotice: signal(''),
    };
    const router = { navigate: vi.fn() };
    const component = createLoginComponent(auth as unknown as AuthService, router);
    component.email = 'qa@example.com';
    component.password = 'wrong-password';

    component.handleLogin();

    expect(auth.login).toHaveBeenCalledWith('qa@example.com', 'wrong-password');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Credenciales inválidas');
    expect(component.isLoading()).toBe(false);
  });

  it('toggles password visibility and blocks an empty credential submission', () => {
    const auth = {
      login: vi.fn(() => of(true)),
      loginReadOnly: vi.fn(() => of(true)),
      sessionNotice: signal(''),
    };
    const component = createLoginComponent(auth, { navigate: vi.fn() });

    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);

    component.handleLogin();
    expect(auth.login).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('Por favor ingresa');
  });
});
