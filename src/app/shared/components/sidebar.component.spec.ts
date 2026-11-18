import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent accordion and navigation behavior', () => {
  it('opens only the active page branch and closes the other submenus on navigate', () => {
    const events$ = new Subject();
    const router = {
      url: '/trazabilidad/inicio',
      events: events$.asObservable(),
      navigate: () => {},
    };
    const auth = { isAuthenticated: () => true };
    const ui = { sidebarExpanded: () => true, setSidebar: () => {} };

    const injector = Injector.create({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: UiStateService, useValue: ui },
      ],
    });

    const component = runInInjectionContext(injector, () => new SidebarComponent());
    component.ngOnInit();

    // Simular que el usuario abrió otros acordeones mientras exploraba
    component.toggleSubmenu('fabricacion');
    component.toggleVentas();
    expect(component.openSubmenus()['fabricacion']).toBe(true);
    expect(component.openVentas()).toBe(true);

    // Cuando el usuario selecciona una página concreta (ej: Ingreso MP Formato)
    component.navigateTo('/trazabilidad/estaciones/materia-prima/ingreso/formato');

    // Debe quedar abierta SOLO la sección de materia prima / ingreso y cerrarse las demás
    expect(component.openEstaciones()).toBe(true);
    expect(component.openVentas()).toBe(false);
    expect(component.openSubmenus()['materias-primas']).toBe(true);
    expect(component.openSubmenus()['fabricacion']).toBe(false);
    expect(component.openSubmenus()['control-calidad']).toBe(false);
    expect(component.openInnerSections()['ingreso-mp']).toBe(true);
    expect(component.openInnerSections()['consumo-mp']).toBe(false);
  });

  it('closes estaciones and opens only pedidos when navigating to commercial orders', () => {
    const events$ = new Subject();
    const router = {
      url: '/trazabilidad/inicio',
      events: events$.asObservable(),
      navigate: () => {},
    };
    const auth = { isAuthenticated: () => true };
    const ui = { sidebarExpanded: () => true, setSidebar: () => {} };

    const injector = Injector.create({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: UiStateService, useValue: ui },
      ],
    });

    const component = runInInjectionContext(injector, () => new SidebarComponent());
    component.ngOnInit();

    component.navigateTo('/trazabilidad/comercial/pedidos/registros');

    expect(component.openEstaciones()).toBe(false);
    expect(component.openVentas()).toBe(true);
    expect(component.openInnerSections()['comercial-pedidos']).toBe(true);
    expect(component.openInnerSections()['comercial-clientes']).toBe(false);
    expect(component.openInnerSections()['comercial-productos']).toBe(false);
  });
});
