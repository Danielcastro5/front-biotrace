import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { HomeComponent, IngresoMateriaPrimaItem } from './home.component';

function createHomeComponent(): HomeComponent {
  const injector = Injector.create({
    providers: [
      { provide: ApiService, useValue: {} },
      { provide: AuthService, useValue: {} },
      { provide: UiStateService, useValue: new UiStateService() },
    ],
  });

  return runInInjectionContext(injector, () => new HomeComponent());
}

function createIngreso(id: string): IngresoMateriaPrimaItem {
  return {
    id,
    loteInterno: `LI-${id}`,
    producto: 'Insumo',
    codigoInsumo: 'M-1',
    fechaRecepcion: '2026-01-02',
    proveedor: 'Proveedor',
    loteProveedor: 'LP-1',
    cantidadRecibida: 5,
    unidades: 'kg',
    precioPorUnidad: null,
    costoTotal: null,
    fechaFabricacion: '',
    fechaVencimiento: '',
    estadoCalidad: 'Sin registro',
    aspecto: '',
    colorOlor: '',
    phDensidad: '',
    coaArchivo: '',
    liberadoPor: '',
    observaciones: '',
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HomeComponent interactions', () => {
  it('updates the selected tab and module from navigation actions', () => {
    const component = createHomeComponent();

    component.setTab('form');
    expect(component.ui.activeTab()).toBe('form');

    component.openModule('clientes', 'list');
    expect(component.ui.activeModule()).toBe('clientes');
    expect(component.ui.activeTab()).toBe('list');
  });

  it('applies edits to the current view without persisting them', () => {
    const component = createHomeComponent();
    const record = createIngreso('1');
    component.recordsMpIngreso = [record];
    component.selectedEditItem = record;
    component.editForm = { ...record, proveedor: 'Proveedor actualizado' };

    component.guardarEdicion();

    expect(component.recordsMpIngreso[0].proveedor).toBe('Proveedor actualizado');
    expect(component.selectedEditItem).toBeNull();
    expect(component.feedbackMessage()).toContain('no se guardaron en el servidor');
  });

  it('changes pages and displays the selected page of records', () => {
    const component = createHomeComponent();
    component.recordsMpIngreso = [createIngreso('1'), createIngreso('2'), createIngreso('3')];
    component.pageSize = 1;
    component.searchTerm = '';
    component.filtroEstado = 'TODOS';
    component.filtroFecha = '';

    component.goToPage(3);

    expect(component.currentPage).toBe(3);
    expect(component.paginatedMpIngresos().map((record) => record.id)).toEqual(['3']);
    expect(component.firstVisibleRecord).toBe(3);
    expect(component.lastVisibleRecord).toBe(3);
  });

  it('clears every editable receipt field and the selected file', () => {
    const component = createHomeComponent();
    const fileInput = { value: 'coa.pdf' } as HTMLInputElement;

    component.resetFormMp(fileInput);

    expect(component.formMp.ordenCompra).toBe('');
    expect(component.formMp.aspecto).toBe('');
    expect(component.formMp.observaciones).toBe('');
    expect(component.formMp.coaArchivo).toBe('');
    expect(fileInput.value).toBe('');
  });

  it('only hides a record from the current view after confirmation', () => {
    const component = createHomeComponent();
    const record = createIngreso('1');
    component.recordsMpIngreso = [record];
    const confirm = vi.fn(() => true);
    vi.stubGlobal('window', { confirm });

    component.eliminarIngreso(record);

    expect(confirm).toHaveBeenCalledOnce();
    expect(component.recordsMpIngreso).toEqual([]);
    expect(component.feedbackMessage()).toContain('no se eliminó del servidor');
  });

  it('keeps a record when local removal is cancelled', () => {
    const component = createHomeComponent();
    const record = createIngreso('1');
    component.recordsMpIngreso = [record];
    vi.stubGlobal('window', { confirm: vi.fn(() => false) });

    component.eliminarIngreso(record);

    expect(component.recordsMpIngreso).toEqual([record]);
  });
});
