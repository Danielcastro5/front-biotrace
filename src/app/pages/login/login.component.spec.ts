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
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.isLoading()).toBe(false);
  });

  it('uses the read-only sign-in action when selected', () => {
    const auth = {
      login: vi.fn(() => of(true)),
      loginReadOnly: vi.fn(() => of(true)),
      sessionNotice: signal(''),
    };
    const router = { navigate: vi.fn() };
    const component = createLoginComponent(auth, router);
    component.readOnlyAccess = true;
    component.password = ' query-key ';

    component.handleLogin();

    expect(auth.loginReadOnly).toHaveBeenCalledWith('query-key');
    expect(auth.login).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
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
