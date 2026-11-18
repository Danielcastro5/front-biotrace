import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { AuthService } from './core/services/auth.service';
import { UiStateService } from './core/services/ui-state.service';
import { AppComponent } from './app.component';

describe('AppComponent layout shell logic', () => {
  it('hides shell when route is /login even if authenticated', () => {
    const events$ = new Subject();
    const router = {
      url: '/login',
      events: events$.asObservable(),
    };
    const auth = {
      isAuthenticated: signal(true),
    };
    const ui = {};

    const injector = Injector.create({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: UiStateService, useValue: ui },
      ],
    });

    const app = runInInjectionContext(injector, () => new AppComponent());
    expect(app.isLoginRoute()).toBe(true);
    expect(app.showShell()).toBe(false);
  });

  it('shows shell when authenticated and on /trazabilidad/inicio', () => {
    const events$ = new Subject();
    const router = {
      url: '/trazabilidad/inicio',
      events: events$.asObservable(),
    };
    const auth = {
      isAuthenticated: signal(true),
    };
    const ui = {};

    const injector = Injector.create({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: UiStateService, useValue: ui },
      ],
    });

    const app = runInInjectionContext(injector, () => new AppComponent());
    expect(app.isLoginRoute()).toBe(false);
    expect(app.showShell()).toBe(true);
  });

  it('hides shell when not authenticated', () => {
    const events$ = new Subject();
    const router = {
      url: '/trazabilidad/inicio',
      events: events$.asObservable(),
    };
    const auth = {
      isAuthenticated: signal(false),
    };
    const ui = {};

    const injector = Injector.create({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: UiStateService, useValue: ui },
      ],
    });

    const app = runInInjectionContext(injector, () => new AppComponent());
    expect(app.showShell()).toBe(false);
  });
});
