import { describe, expect, it } from 'vitest';
import { UiStateService } from './ui-state.service';

describe('UiStateService', () => {
  it('toggles and sets the sidebar state', () => {
    const state = new UiStateService();
    state.setSidebar(false);

    state.toggleSidebar();
    expect(state.sidebarExpanded()).toBe(true);

    state.setSidebar(false);
    expect(state.sidebarExpanded()).toBe(false);
  });

  it('navigates to a selected module and tab', () => {
    const state = new UiStateService();

    state.navigateTo('clientes', 'form');
    expect(state.activeModule()).toBe('clientes');
    expect(state.activeTab()).toBe('form');

    state.navigateTo('pedidos');
    expect(state.activeModule()).toBe('pedidos');
    expect(state.activeTab()).toBe('list');
  });
});
