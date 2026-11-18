import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { UiStateService } from '../../core/services/ui-state.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside
      class="lap-portal-sidebar"
      [class.lap-portal-sidebar--open]="ui.sidebarExpanded()"
      [class.lap-portal-sidebar--closed]="!ui.sidebarExpanded()"
      *ngIf="auth.isAuthenticated()"
    >
      <div class="lap-portal-sidebar__content">
        
        <!-- ============================================== -->
        <!-- 1. BOTÓN SUPERIOR: PANEL PRINCIPAL (INICIO)   -->
        <!-- ============================================== -->
        <div class="lap-portal-sidebar__nav">
          <button
            type="button"
            (click)="navigateTo('/trazabilidad/inicio')"
            class="lap-sidebar-nav-item"
            [class.lap-sidebar-nav-item--active]="isRouteActive('/trazabilidad/inicio')"
            title="Inicio"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span *ngIf="ui.sidebarExpanded()">Panel Principal</span>
          </button>
        </div>

        <!-- ============================================== -->
        <!-- MODO EXPANDIDO: ÁRBOL DE MENÚS Y ACORDEONES   -->
        <!-- ============================================== -->
        <div *ngIf="ui.sidebarExpanded()" class="lap-sidebar-nav">
          
          <!-- SECCIÓN: ESTACIONES -->
          <span class="lap-sidebar-section-title">Estaciones</span>

          <!-- GRAN MENÚ 1: ESTACIONES / PRODUCCIÓN -->
          <div class="lap-sidebar-station-group lap-sidebar-master-group">
            <button
              type="button"
              (click)="toggleEstaciones()"
              class="lap-sidebar-station-header lap-sidebar-master-header"
              [class.lap-sidebar-master-header--open]="openEstaciones()"
              title="Estaciones de Producción"
            >
              <div class="lap-sidebar-station-header__left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                  <path d="M17 18h1"></path>
                  <path d="M12 18h1"></path>
                  <path d="M7 18h1"></path>
                </svg>
                <span class="lap-sidebar-master-header__text">ESTACIONES</span>
              </div>
              <svg *ngIf="openEstaciones()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <svg *ngIf="!openEstaciones()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <!-- CONTENEDOR ANIDADO DE ESTACIONES -->
            <div class="lap-sidebar-nested-container" *ngIf="openEstaciones()">
              
              <!-- ========================================== -->
              <!-- SUBMENÚ 1: MATERIAS PRIMAS                -->
              <!-- ========================================== -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleSubmenu('materias-primas')"
                  class="lap-sidebar-station-header lap-sidebar-subgroup-header"
                  [class.lap-sidebar-subgroup-header--active]="openSubmenus()['materias-primas'] || isCurrentPath('materia-prima')"
                  title="Materias Primas"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span>Materias Primas</span>
                  </div>
                  <svg *ngIf="openSubmenus()['materias-primas']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openSubmenus()['materias-primas']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <!-- SUB-ESTACIONES ANIDADAS DE MATERIAS PRIMAS -->
                <div class="lap-sidebar-submenu lap-sidebar-nested-substations" *ngIf="openSubmenus()['materias-primas']">
                  
                  <!-- A. INGRESO MATERIA PRIMA (Submenú con Llenar Formato y Ver Registros) -->
                  <div class="lap-sidebar-station-group">
                    <button
                      type="button"
                      (click)="toggleInnerSection('ingreso-mp')"
                      class="lap-sidebar-station-header lap-sidebar-station-header--sub"
                      [class.lap-sidebar-station-header--active]="isCurrentPath('materia-prima/ingreso')"
                      title="Ingreso materia prima"
                    >
                      <div class="lap-sidebar-station-header__left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M16 16h6"></path>
                          <path d="M19 13v6"></path>
                          <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
                          <polyline points="3.29 7 12 12 20.71 7"></polyline>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                        </svg>
                        <span>Ingreso materia prima</span>
                      </div>
                      <svg *ngIf="openInnerSections()['ingreso-mp']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <svg *ngIf="!openInnerSections()['ingreso-mp']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    <!-- Páginas Independientes: Llenar formato & Ver registros -->
                    <div class="lap-sidebar-submenu lap-sidebar-submenu--sub" *ngIf="openInnerSections()['ingreso-mp']">
                      <button
                        type="button"
                        (click)="navigateTo('/trazabilidad/estaciones/materia-prima/ingreso/formato')"
                        class="lap-sidebar-subitem"
                        [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/materia-prima/ingreso/formato')"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <span>Llenar formato</span>
                      </button>

                      <button
                        type="button"
                        (click)="navigateTo('/trazabilidad/estaciones/materia-prima/ingreso/registros')"
                        class="lap-sidebar-subitem"
                        [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/materia-prima/ingreso/registros')"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Ver registros</span>
                      </button>
                    </div>
                  </div>

                  <!-- B. CONSUMO MATERIA PRIMA (Submenú con Llenar Formato y Ver Registros) -->
                  <div class="lap-sidebar-station-group">
                    <button
                      type="button"
                      (click)="toggleInnerSection('consumo-mp')"
                      class="lap-sidebar-station-header lap-sidebar-station-header--sub"
                      [class.lap-sidebar-station-header--active]="isCurrentPath('materia-prima/consumo')"
                      title="Consumo materia prima"
                    >
                      <div class="lap-sidebar-station-header__left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M16 16h6"></path>
                          <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
                          <polyline points="3.29 7 12 12 20.71 7"></polyline>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                        </svg>
                        <span>Consumo materia prima</span>
                      </div>
                      <svg *ngIf="openInnerSections()['consumo-mp']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <svg *ngIf="!openInnerSections()['consumo-mp']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    <!-- Páginas Independientes: Llenar formato & Ver registros -->
                    <div class="lap-sidebar-submenu lap-sidebar-submenu--sub" *ngIf="openInnerSections()['consumo-mp']">
                      <button
                        type="button"
                        (click)="navigateTo('/trazabilidad/estaciones/materia-prima/consumo/formato')"
                        class="lap-sidebar-subitem"
                        [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/materia-prima/consumo/formato')"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <span>Llenar formato</span>
                      </button>

                      <button
                        type="button"
                        (click)="navigateTo('/trazabilidad/estaciones/materia-prima/consumo/registros')"
                        class="lap-sidebar-subitem"
                        [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/materia-prima/consumo/registros')"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Ver registros</span>
                      </button>
                    </div>
                  </div>

                  <!-- C. INVENTARIO Y STOCK -->
                  <div class="lap-sidebar-station-group">
                    <button
                      type="button"
                      (click)="navigateTo('/trazabilidad/estaciones/materia-prima/inventario')"
                      class="lap-sidebar-subitem"
                      [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/materia-prima/inventario')"
                      title="Inventario y Stock de Materias Primas"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span>Inventario y Stock</span>
                    </button>
                  </div>

                </div>
              </div>

              <!-- ========================================== -->
              <!-- SUBMENÚ 2: FABRICACIÓN                     -->
              <!-- ========================================== -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleSubmenu('fabricacion')"
                  class="lap-sidebar-station-header lap-sidebar-subgroup-header"
                  [class.lap-sidebar-subgroup-header--active]="openSubmenus()['fabricacion'] || isCurrentPath('fabricacion')"
                  title="Fabricación"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span>Fabricación</span>
                  </div>
                  <svg *ngIf="openSubmenus()['fabricacion']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openSubmenus()['fabricacion']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div class="lap-sidebar-submenu lap-sidebar-nested-substations" *ngIf="openSubmenus()['fabricacion']">
                  <!-- Llenar Formato -->
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/estaciones/fabricacion/formato')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/fabricacion/formato')"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Llenar formato</span>
                  </button>

                  <!-- Ver Registros -->
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/estaciones/fabricacion/registros')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/fabricacion/registros')"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Ver registros</span>
                  </button>
                </div>
              </div>

              <!-- ========================================== -->
              <!-- SUBMENÚ 3: CONTROL DE CALIDAD              -->
              <!-- ========================================== -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleSubmenu('control-calidad')"
                  class="lap-sidebar-station-header lap-sidebar-subgroup-header"
                  [class.lap-sidebar-subgroup-header--active]="openSubmenus()['control-calidad'] || isCurrentPath('control-calidad')"
                  title="Control de Calidad"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <polyline points="9 12 11 14 15 10"></polyline>
                    </svg>
                    <span>Control de Calidad</span>
                  </div>
                  <svg *ngIf="openSubmenus()['control-calidad']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openSubmenus()['control-calidad']" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div class="lap-sidebar-submenu lap-sidebar-nested-substations" *ngIf="openSubmenus()['control-calidad']">
                  <!-- Llenar Formato -->
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/estaciones/control-calidad/formato')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/control-calidad/formato')"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Llenar formato</span>
                  </button>

                  <!-- Ver Registros -->
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/estaciones/control-calidad/registros')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/estaciones/control-calidad/registros')"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Ver registros</span>
                  </button>
                </div>
              </div>

              <!-- ========================================== -->
              <!-- SUBMENÚ 4: TRAZABILIDAD 360° (PÁGINA ÚNICA)  -->
              <!-- ========================================== -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="navigateTo('/trazabilidad/estaciones/trazabilidad-360')"
                  class="lap-sidebar-station-header lap-sidebar-subgroup-header"
                  [class.lap-sidebar-subgroup-header--active]="isRouteActive('/trazabilidad/estaciones/trazabilidad-360')"
                  title="Trazabilidad 360° Integral"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Trazabilidad 360°</span>
                  </div>
                </button>
              </div>

            </div>
          </div>

          <!-- SECCIÓN: GESTIÓN COMERCIAL / VENTAS -->
          <span class="lap-sidebar-section-title" style="margin-top: 8px;">Comercial</span>

          <!-- GRAN MENÚ 2: COMERCIAL -->
          <div class="lap-sidebar-station-group lap-sidebar-master-group">
            <button
              type="button"
              (click)="toggleVentas()"
              class="lap-sidebar-station-header lap-sidebar-master-header"
              [class.lap-sidebar-master-header--open]="openVentas()"
              title="Ventas, Clientes y Pedidos"
            >
              <div class="lap-sidebar-station-header__left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                <span class="lap-sidebar-master-header__text">COMERCIAL</span>
              </div>
              <svg *ngIf="openVentas()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <svg *ngIf="!openVentas()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <!-- CONTENEDOR ANIDADO DE COMERCIAL -->
            <div class="lap-sidebar-nested-container" *ngIf="openVentas()">
              
              <!-- 1. Clientes -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleInnerSection('comercial-clientes')"
                  class="lap-sidebar-station-header lap-sidebar-station-header--sub"
                  [class.lap-sidebar-station-header--active]="isCurrentPath('comercial/clientes')"
                  title="Gestión de Clientes"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>Clientes</span>
                  </div>
                  <svg *ngIf="openInnerSections()['comercial-clientes']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openInnerSections()['comercial-clientes']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div class="lap-sidebar-submenu lap-sidebar-submenu--sub" *ngIf="openInnerSections()['comercial-clientes']">
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/clientes/formato')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/clientes/formato')"
                  >
                    <span>Llenar formato</span>
                  </button>
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/clientes/registros')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/clientes/registros')"
                  >
                    <span>Ver registros</span>
                  </button>
                </div>
              </div>

              <!-- 2. Productos -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleInnerSection('comercial-productos')"
                  class="lap-sidebar-station-header lap-sidebar-station-header--sub"
                  [class.lap-sidebar-station-header--active]="isCurrentPath('comercial/productos')"
                  title="Catálogo de Productos"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <span>Productos</span>
                  </div>
                  <svg *ngIf="openInnerSections()['comercial-productos']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openInnerSections()['comercial-productos']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div class="lap-sidebar-submenu lap-sidebar-submenu--sub" *ngIf="openInnerSections()['comercial-productos']">
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/productos/formato')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/productos/formato')"
                  >
                    <span>Llenar formato</span>
                  </button>
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/productos/registros')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/productos/registros')"
                  >
                    <span>Ver registros</span>
                  </button>
                </div>
              </div>

              <!-- 3. Pedidos -->
              <div class="lap-sidebar-station-group">
                <button
                  type="button"
                  (click)="toggleInnerSection('comercial-pedidos')"
                  class="lap-sidebar-station-header lap-sidebar-station-header--sub"
                  [class.lap-sidebar-station-header--active]="isCurrentPath('comercial/pedidos')"
                  title="Órdenes de Pedido & Salida"
                >
                  <div class="lap-sidebar-station-header__left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                      <path d="M3 6h18"></path>
                    </svg>
                    <span>Órdenes de Pedido</span>
                  </div>
                  <svg *ngIf="openInnerSections()['comercial-pedidos']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <svg *ngIf="!openInnerSections()['comercial-pedidos']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div class="lap-sidebar-submenu lap-sidebar-submenu--sub" *ngIf="openInnerSections()['comercial-pedidos']">
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/pedidos/formato')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/pedidos/formato')"
                  >
                    <span>Llenar formato</span>
                  </button>
                  <button
                    type="button"
                    (click)="navigateTo('/trazabilidad/comercial/pedidos/registros')"
                    class="lap-sidebar-subitem"
                    [class.lap-sidebar-subitem--active]="isRouteActive('/trazabilidad/comercial/pedidos/registros')"
                  >
                    <span>Ver registros</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- ============================================== -->
        <!-- MODO COMPACTO (MINI SLOTS)                     -->
        <!-- ============================================== -->
        <div *ngIf="!ui.sidebarExpanded()" class="lap-portal-sidebar__mini-icons">
          <div
            class="lap-portal-mini-slot"
            [class.lap-portal-mini-slot--active]="openEstaciones()"
            title="Estaciones de Producción"
            (click)="expandWithEstaciones()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
              <path d="M17 18h1"></path>
              <path d="M12 18h1"></path>
              <path d="M7 18h1"></path>
            </svg>
          </div>

          <div
            class="lap-portal-mini-slot"
            [class.lap-portal-mini-slot--active]="openVentas()"
            title="Comercial / Clientes / Pedidos"
            (click)="expandWithVentas()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
          </div>
        </div>

      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      flex-shrink: 0;
      height: 100%;
      z-index: 90;
    }

    .lap-portal-sidebar {
      height: 100%;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      box-shadow: 1px 0 3px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }

    .lap-portal-sidebar--open {
      width: 275px;
    }

    .lap-portal-sidebar--closed {
      width: 64px;
    }

    .lap-portal-sidebar__content {
      flex: 1;
      padding: 0.75rem 0.65rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .lap-portal-sidebar__content::-webkit-scrollbar {
      width: 4px;
    }

    .lap-portal-sidebar__content::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 4px;
    }

    .lap-portal-sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .lap-sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: #475569;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .lap-portal-sidebar--closed .lap-sidebar-nav-item {
      justify-content: center;
      padding: 10px 0;
    }

    .lap-sidebar-nav-item:hover {
      background: linear-gradient(135deg, rgba(241, 245, 249, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%);
      color: #0f172a;
      border-color: rgba(203, 213, 225, 0.8);
      box-shadow: 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    }

    /* ======================================================== */
    /* ESTILOS LIQUID GLASS PARA ELEMENTOS ACTIVOS DEL MENÚ     */
    /* ======================================================== */
    .lap-sidebar-nav-item--active {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(14, 165, 233, 0.08) 50%, rgba(255, 255, 255, 0.75) 100%) !important;
      backdrop-filter: blur(14px) saturate(190%);
      -webkit-backdrop-filter: blur(14px) saturate(190%);
      border: 1px solid rgba(6, 182, 212, 0.45) !important;
      box-shadow: 
        inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95),
        0 4px 14px -2px rgba(6, 182, 212, 0.25),
        0 1px 3px 0 rgba(15, 23, 42, 0.04) !important;
      color: #0891b2 !important;
      font-weight: 700;
    }

    .lap-sidebar-nav-item--active svg {
      color: #0891b2;
      filter: drop-shadow(0 1px 3px rgba(6, 182, 212, 0.45));
    }

    .lap-sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .lap-sidebar-section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      padding: 6px 10px 2px 10px;
    }

    .lap-sidebar-station-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lap-sidebar-station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: #334155;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .lap-sidebar-station-header:hover {
      background: linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
      color: #0f172a;
      border-color: rgba(226, 232, 240, 0.7);
    }

    .lap-sidebar-station-header__left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lap-sidebar-station-header__left svg {
      flex-shrink: 0;
      color: #0891b2;
    }

    .lap-sidebar-master-group {
      margin-bottom: 4px;
    }

    .lap-sidebar-master-header {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 9px 12px;
      transition: all 0.2s ease;
    }

    .lap-sidebar-master-header:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .lap-sidebar-master-header--open {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(240, 253, 255, 0.85) 100%) !important;
      border: 1px solid rgba(6, 182, 212, 0.38) !important;
      color: #0891b2 !important;
      box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 3px 10px -2px rgba(6, 182, 212, 0.15) !important;
    }

    .lap-sidebar-master-header__text {
      font-weight: 800;
      letter-spacing: 0.04em;
      font-size: 12.5px;
    }

    .lap-sidebar-nested-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding-left: 8px;
      margin-left: 10px;
      margin-top: 4px;
      margin-bottom: 8px;
      border-left: 2px solid #e2e8f0;
    }

    .lap-sidebar-subgroup-header {
      font-size: 12.5px;
      padding: 7px 10px;
      color: #475569;
      border-radius: 9px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .lap-sidebar-subgroup-header:hover {
      background: linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
      color: #0f172a;
      border-color: rgba(226, 232, 240, 0.8);
    }

    .lap-sidebar-subgroup-header--active {
      color: #0891b2 !important;
      font-weight: 700 !important;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(255, 255, 255, 0.8) 100%) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(6, 182, 212, 0.32) !important;
      box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.85), 0 2px 8px -2px rgba(6, 182, 212, 0.15) !important;
    }

    .lap-sidebar-nested-substations {
      padding-left: 6px;
      margin-left: 8px;
      margin-top: 3px;
      margin-bottom: 4px;
      border-left: 1.5px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lap-sidebar-station-header--sub {
      font-size: 12px;
      padding: 6px 8px;
      font-weight: 600;
      border-radius: 8px;
      white-space: nowrap;
      overflow: hidden;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .lap-sidebar-station-header--sub:hover {
      background: rgba(241, 245, 249, 0.85);
      border-color: rgba(226, 232, 240, 0.8);
    }

    .lap-sidebar-station-header--sub .lap-sidebar-station-header__left {
      gap: 6px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lap-sidebar-station-header--sub span {
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lap-sidebar-station-header--active {
      color: #0891b2 !important;
      font-weight: 700 !important;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(255, 255, 255, 0.8) 100%) !important;
      border: 1px solid rgba(6, 182, 212, 0.35) !important;
      box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 2px 8px -2px rgba(6, 182, 212, 0.16) !important;
    }

    .lap-sidebar-submenu--sub {
      padding-left: 14px;
      margin-left: 8px;
      margin-top: 2px;
      margin-bottom: 4px;
      border-left: 1.5px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .lap-sidebar-subitem {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 9px;
      border: 1px solid transparent;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      text-align: left;
      width: 100%;
      position: relative;
    }

    .lap-sidebar-subitem:hover:not(.lap-sidebar-subitem--active) {
      background: linear-gradient(135deg, rgba(241, 245, 249, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-color: rgba(226, 232, 240, 0.85);
      color: #0f172a;
      box-shadow: 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    }

    /* BOTONES SELECCIONADOS: LIQUID GLASS ELEVADO */
    .lap-sidebar-subitem--active {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(14, 165, 233, 0.09) 50%, rgba(255, 255, 255, 0.75) 100%) !important;
      backdrop-filter: blur(14px) saturate(190%);
      -webkit-backdrop-filter: blur(14px) saturate(190%);
      border: 1px solid rgba(6, 182, 212, 0.45) !important;
      box-shadow: 
        inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95),
        0 4px 14px -2px rgba(6, 182, 212, 0.22),
        0 1px 3px 0 rgba(15, 23, 42, 0.05) !important;
      color: #0e7490 !important;
      font-weight: 700 !important;
      padding-left: 14px !important;
    }

    .lap-sidebar-subitem--active::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 3.5px;
      height: 60%;
      border-radius: 999px;
      background: #06b6d4;
      box-shadow: 0 0 10px #06b6d4, 0 0 3px #0891b2;
    }

    .lap-sidebar-subitem--active svg {
      color: #0891b2 !important;
      filter: drop-shadow(0 1px 3px rgba(6, 182, 212, 0.45));
    }

    .lap-sidebar-subitem svg {
      flex-shrink: 0;
      transition: color 0.15s ease, transform 0.15s ease;
    }

    .lap-portal-sidebar__mini-icons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    .lap-portal-mini-slot {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #0891b2;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .lap-portal-mini-slot:hover {
      background: #ecfeff;
      border-color: rgba(6, 182, 212, 0.35);
      color: #06b6d4;
    }

    .lap-portal-mini-slot--active {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(255, 255, 255, 0.8) 100%);
      color: #0891b2;
      border: 1px solid rgba(6, 182, 212, 0.45);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 3px 10px -1px rgba(6, 182, 212, 0.25);
    }
  `]
})
export class SidebarComponent implements OnInit {
  ui = inject(UiStateService);
  auth = inject(AuthService);
  private router = inject(Router);

  currentUrl = signal<string>('');

  openEstaciones = signal<boolean>(true);
  openVentas = signal<boolean>(false);

  openSubmenus = signal<Record<string, boolean>>({
    'materias-primas': true,
    'fabricacion': false,
    'control-calidad': false,
    'trazabilidad-360': false
  });

  openInnerSections = signal<Record<string, boolean>>({
    'ingreso-mp': true,
    'consumo-mp': false
  });

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    this.syncAccordionsWithUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.syncAccordionsWithUrl(event.urlAfterRedirects);
      });
  }

  private syncAccordionsWithUrl(url: string) {
    if (!url) return;
    const cleanUrl = url.split('?')[0].split('#')[0];

    if (cleanUrl.startsWith('/trazabilidad/estaciones')) {
      this.openEstaciones.set(true);
      this.openVentas.set(false);

      if (cleanUrl.includes('materia-prima')) {
        this.openSubmenus.set({
          'materias-primas': true,
          'fabricacion': false,
          'control-calidad': false,
          'trazabilidad-360': false
        });

        if (cleanUrl.includes('/ingreso')) {
          this.openInnerSections.set({
            'ingreso-mp': true,
            'consumo-mp': false,
            'comercial-clientes': false,
            'comercial-productos': false,
            'comercial-pedidos': false
          });
        } else if (cleanUrl.includes('/consumo')) {
          this.openInnerSections.set({
            'ingreso-mp': false,
            'consumo-mp': true,
            'comercial-clientes': false,
            'comercial-productos': false,
            'comercial-pedidos': false
          });
        } else {
          // Inventario y Stock
          this.openInnerSections.set({
            'ingreso-mp': false,
            'consumo-mp': false,
            'comercial-clientes': false,
            'comercial-productos': false,
            'comercial-pedidos': false
          });
        }
      } else if (cleanUrl.includes('fabricacion')) {
        this.openSubmenus.set({
          'materias-primas': false,
          'fabricacion': true,
          'control-calidad': false,
          'trazabilidad-360': false
        });
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': false,
          'comercial-productos': false,
          'comercial-pedidos': false
        });
      } else if (cleanUrl.includes('control-calidad')) {
        this.openSubmenus.set({
          'materias-primas': false,
          'fabricacion': false,
          'control-calidad': true,
          'trazabilidad-360': false
        });
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': false,
          'comercial-productos': false,
          'comercial-pedidos': false
        });
      } else if (cleanUrl.includes('trazabilidad-360')) {
        this.openSubmenus.set({
          'materias-primas': false,
          'fabricacion': false,
          'control-calidad': false,
          'trazabilidad-360': true
        });
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': false,
          'comercial-productos': false,
          'comercial-pedidos': false
        });
      }
    } else if (cleanUrl.startsWith('/trazabilidad/comercial')) {
      this.openEstaciones.set(false);
      this.openVentas.set(true);
      this.openSubmenus.set({
        'materias-primas': false,
        'fabricacion': false,
        'control-calidad': false,
        'trazabilidad-360': false
      });

      if (cleanUrl.includes('/clientes')) {
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': true,
          'comercial-productos': false,
          'comercial-pedidos': false
        });
      } else if (cleanUrl.includes('/productos')) {
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': false,
          'comercial-productos': true,
          'comercial-pedidos': false
        });
      } else if (cleanUrl.includes('/pedidos')) {
        this.openInnerSections.set({
          'ingreso-mp': false,
          'consumo-mp': false,
          'comercial-clientes': false,
          'comercial-productos': false,
          'comercial-pedidos': true
        });
      }
    } else {
      // Panel Principal u otras rutas generales
      this.openEstaciones.set(false);
      this.openVentas.set(false);
      this.openSubmenus.set({
        'materias-primas': false,
        'fabricacion': false,
        'control-calidad': false,
        'trazabilidad-360': false
      });
      this.openInnerSections.set({
        'ingreso-mp': false,
        'consumo-mp': false,
        'comercial-clientes': false,
        'comercial-productos': false,
        'comercial-pedidos': false
      });
    }
  }

  toggleEstaciones() {
    this.openEstaciones.update(v => !v);
  }

  toggleVentas() {
    this.openVentas.update(v => !v);
  }

  toggleSubmenu(key: string) {
    this.openSubmenus.update(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  toggleInnerSection(key: string) {
    this.openInnerSections.update(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  isRouteActive(route: string): boolean {
    return this.currentUrl() === route || this.currentUrl().startsWith(route + '/');
  }

  isCurrentPath(keyword: string): boolean {
    return this.currentUrl().includes(keyword);
  }

  expandWithEstaciones() {
    this.ui.setSidebar(true);
    this.openEstaciones.set(true);
    this.openVentas.set(false);
  }

  expandWithVentas() {
    this.ui.setSidebar(true);
    this.openVentas.set(true);
    this.openEstaciones.set(false);
  }

  navigateTo(path: string) {
    this.syncAccordionsWithUrl(path);
    this.router.navigate([path]);
  }
}
