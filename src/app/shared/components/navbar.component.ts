import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UiStateService } from '../../core/services/ui-state.service';

interface PageItem {
  title: string;
  category: string;
  path: string;
  iconType: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="navbar" *ngIf="auth.isAuthenticated()">
      <div class="navbar-left">
        <!-- Botón Interactivo de Menú Lateral -->
        <button
          type="button"
          class="sidebar-menu-btn"
          (click)="ui.toggleSidebar()"
          [title]="ui.sidebarExpanded() ? 'Ocultar menú lateral' : 'Mostrar menú lateral'"
          aria-label="Alternar menú lateral"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <a class="navbar-brand" routerLink="/trazabilidad/inicio" style="text-decoration: none; cursor: pointer;">
          <div class="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#06b6d4" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#ffffff" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#06b6d4" />
              <path d="M10 6.5h4M17.5 10v4M6.5 10v7.5a1 1 0 0 0 1 1H14" stroke="#06b6d4" stroke-linecap="round" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">BioTrace</span>
            <span class="brand-sub">TRAZABILIDAD DE PRECISIÓN</span>
          </div>
        </a>
      </div>

      <!-- BUSCADOR CENTRAL DE PÁGINAS -->
      <div class="navbar-center">
        <div class="search-box-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Buscar página, estación o módulo (Ej: Ingreso, Fabricación, Lotes)..."
              [(ngModel)]="searchQuery"
              (focus)="isSearchFocused.set(true)"
              (input)="filterPages()"
            />
            <button
              *ngIf="searchQuery"
              class="clear-search-btn"
              (click)="searchQuery = ''; filterPages()"
              title="Borrar búsqueda"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- DROPDOWN DE RESULTADOS DE BÚSQUEDA -->
          <div class="search-results-dropdown" *ngIf="isSearchFocused() && filteredPages().length > 0">
            <div class="search-results-header">
              <span>PÁGINAS Y ESTACIONES ({{ filteredPages().length }})</span>
            </div>
            <div class="search-results-list">
              <div
                *ngFor="let page of filteredPages()"
                class="search-result-item"
                (mousedown)="selectPage(page.path)"
              >
                <div class="result-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div class="result-texts">
                  <span class="result-title">{{ page.title }}</span>
                  <span class="result-category">{{ page.category }}</span>
                </div>
                <span class="result-action">Ir &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DERECHA: PILL DE USUARIO Y BOTÓN DE TUERCA (SETTINGS) -->
      <div class="navbar-right">
        <!-- Perfil de Usuario Logueado -->
        <div class="user-badge" *ngIf="auth.currentUser() as user">
          <div class="avatar">{{ user.name ? user.name.slice(0, 2).toUpperCase() : 'US' }}</div>
          <div class="user-details">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>

        <!-- BOTÓN DE LA TUERCA (CONFIGURACIÓN / AUDITORÍA / REPORTES) -->
        <div class="settings-menu-container">
          <button
            type="button"
            class="gear-btn"
            [class.gear-btn--active]="isGearOpen()"
            (click)="toggleGearMenu()"
            title="Opciones del Sistema y Administración"
            aria-label="Abrir panel de opciones"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          <!-- DROPDOWN DE LA TUERCA -->
          <div class="gear-dropdown" *ngIf="isGearOpen()">
            <div class="gear-dropdown-header">
              <span class="dropdown-title">GESTIÓN & SISTEMA</span>
            </div>

            <div class="gear-dropdown-body">
              <!-- Opción 1: Ingresar Usuario -->
              <button type="button" class="dropdown-item" (click)="openUserModal()">
                <div class="dropdown-item-icon icon--blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <div class="dropdown-item-text">
                  <span class="item-title">Ingresar usuario</span>
                  <span class="item-desc">Registrar nuevo personal u operario</span>
                </div>
              </button>

              <!-- Opción 2: Historial de Ingresos -->
              <button type="button" class="dropdown-item" (click)="openHistoryModal()">
                <div class="dropdown-item-icon icon--cyan">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="dropdown-item-text">
                  <span class="item-title">Historial de ingresos</span>
                  <span class="item-desc">Auditoría de accesos y sesiones</span>
                </div>
              </button>

              <!-- Opción 3: Reportes de Errores / Fallas -->
              <button type="button" class="dropdown-item" (click)="openReportModal()">
                <div class="dropdown-item-icon icon--amber">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div class="dropdown-item-text">
                  <span class="item-title">Reportar error de la página</span>
                  <span class="item-desc">Incidencias y fallas técnicas</span>
                </div>
              </button>
            </div>

            <div class="gear-dropdown-divider"></div>

            <!-- Opción Cerrar Sesión -->
            <div class="gear-dropdown-footer">
              <button type="button" class="dropdown-item item--danger" (click)="logout()">
                <div class="dropdown-item-icon icon--red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                <div class="dropdown-item-text">
                  <span class="item-title">Cerrar sesión</span>
                  <span class="item-desc">Finalizar sesión actual</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ======================================================== -->
    <!-- MODAL 1: INGRESAR USUARIO                                -->
    <!-- ======================================================== -->
    <div class="modal-backdrop" *ngIf="showUserModal()" (click)="showUserModal.set(false)">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div>
              <h3>Ingresar Nuevo Usuario</h3>
              <p>Crea las credenciales de acceso para personal de planta o laboratorio</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="showUserModal.set(false)">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input type="text" [(ngModel)]="newUser.name" placeholder="Ej: Dra. Elena Ramírez" class="form-input" />
            </div>
            <div class="form-group">
              <label>Nombre de Usuario *</label>
              <input type="text" [(ngModel)]="newUser.username" placeholder="Ej: eramirez" class="form-input" />
            </div>
            <div class="form-group">
              <label>Correo Electrónico *</label>
              <input type="email" [(ngModel)]="newUser.email" placeholder="ejemplo@biotrace.com" class="form-input" />
            </div>
            <div class="form-group">
              <label>Rol en el Sistema *</label>
              <select [(ngModel)]="newUser.role" class="form-select">
                <option value="Operario">Operario de Producción</option>
                <option value="Analista Calidad">Analista de Calidad (QC/QA)</option>
                <option value="Supervisor">Supervisor de Planta</option>
                <option value="Administrador">Administrador del Sistema</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Contraseña Temporal *</label>
              <input type="password" [(ngModel)]="newUser.password" placeholder="Mínimo 6 caracteres" class="form-input" />
            </div>
          </div>

          <div *ngIf="userModalSuccess()" class="feedback-alert alert--success">
            ✓ Usuario registrado exitosamente en el sistema de trazabilidad.
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="showUserModal.set(false)">Cancelar</button>
          <button type="button" class="btn btn-primary" (click)="saveUser()">Guardar Usuario</button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: HISTORIAL DE INGRESOS (AUDITORÍA)               -->
    <!-- ======================================================== -->
    <div class="modal-backdrop" *ngIf="showHistoryModal()" (click)="showHistoryModal.set(false)">
      <div class="modal-card modal-card--large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h3>Historial de Ingresos & Auditoría</h3>
              <p>Registro cronológico de autenticaciones y actividad de sesiones</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="showHistoryModal.set(false)">&times;</button>
        </div>

        <div class="modal-body modal-table-wrap">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Fecha y Hora</th>
                <th>IP de Origen</th>
                <th>Dispositivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of loginHistory">
                <td class="font-bold">{{ item.user }}</td>
                <td><span class="role-pill">{{ item.role }}</span></td>
                <td>{{ item.timestamp }}</td>
                <td class="font-mono text-xs">{{ item.ip }}</td>
                <td class="text-xs">{{ item.device }}</td>
                <td>
                  <span class="status-badge" [class.badge-success]="item.status === 'Éxito'" [class.badge-danger]="item.status !== 'Éxito'">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="showHistoryModal.set(false)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 3: REPORTAR ERROR DE LA PÁGINA                     -->
    <!-- ======================================================== -->
    <div class="modal-backdrop" *ngIf="showReportModal()" (click)="showReportModal.set(false)">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge icon-badge--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3>Reporte de Incidencias & Errores</h3>
              <p>Comunica anomalías visuales, fallas de cálculo o errores del sistema</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="showReportModal.set(false)">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Estación o Pantalla Afectada *</label>
              <select [(ngModel)]="bugReport.station" class="form-select">
                <option value="Materia Prima - Ingreso">Materia Prima - Ingreso</option>
                <option value="Materia Prima - Consumo">Materia Prima - Consumo</option>
                <option value="Fabricación">Fabricación</option>
                <option value="Control de Calidad">Control de Calidad</option>
                <option value="Comercial">Módulo Comercial</option>
                <option value="Inicio / General">Inicio / General</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nivel de Urgencia *</label>
              <select [(ngModel)]="bugReport.urgency" class="form-select">
                <option value="Baja">Baja - Detalle visual menor</option>
                <option value="Media">Media - Dificulta el trabajo</option>
                <option value="Alta">Alta - Bloqueo en estación</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Descripción detallada de la falla *</label>
              <textarea
                [(ngModel)]="bugReport.description"
                rows="4"
                placeholder="Indica qué estabas haciendo y qué error apareció..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div *ngIf="reportModalSuccess()" class="feedback-alert alert--success">
            ✓ Incidencia reportada exitosamente. El equipo de soporte revisará el caso.
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="showReportModal.set(false)">Cancelar</button>
          <button type="button" class="btn btn-primary" (click)="submitReport()">Enviar Reporte</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .navbar {
      height: 68px;
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }
    .sidebar-menu-btn {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sidebar-menu-btn:hover {
      background: #ecfeff;
      border-color: #06b6d4;
      color: #0891b2;
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.25);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #0891b2;
    }

    /* BUSCADOR CENTRAL */
    .navbar-center {
      flex: 1;
      max-width: 580px;
      margin: 0 auto;
      position: relative;
    }
    .search-box-container {
      position: relative;
      width: 100%;
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 0.85rem;
      height: 40px;
      transition: all 0.2s ease;
    }
    .search-input-wrapper:focus-within {
      background: #ffffff;
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }
    .search-icon {
      color: #94a3b8;
      margin-right: 0.6rem;
      flex-shrink: 0;
    }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      color: #1e293b;
    }
    .search-input::placeholder {
      color: #94a3b8;
      font-size: 0.825rem;
    }
    .clear-search-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .clear-search-btn:hover {
      color: #334155;
    }

    /* DROPDOWN DE BUSCADOR */
    .search-results-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
      max-height: 380px;
      overflow-y: auto;
      z-index: 200;
    }
    .search-results-header {
      padding: 0.6rem 1rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }
    .search-results-list {
      padding: 0.35rem 0;
    }
    .search-result-item {
      display: flex;
      align-items: center;
      padding: 0.65rem 1rem;
      gap: 0.75rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .search-result-item:hover {
      background: #f0fdfa;
    }
    .result-icon-box {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .result-texts {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .result-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #0f172a;
    }
    .result-category {
      font-size: 0.72rem;
      color: #64748b;
    }
    .result-action {
      font-size: 0.78rem;
      font-weight: 600;
      color: #0891b2;
    }

    /* DERECHA */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.15rem;
      flex-shrink: 0;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-right: 0.5rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0f172a;
      color: #06b6d4;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #06b6d4;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.825rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.68rem;
      color: #64748b;
      font-weight: 600;
    }

    /* BOTÓN TUERCA & DROPDOWN */
    .settings-menu-container {
      position: relative;
    }
    .gear-btn {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gear-btn:hover, .gear-btn--active {
      background: #ecfeff;
      border-color: #0891b2;
      color: #0891b2;
      box-shadow: 0 0 8px rgba(8, 145, 178, 0.2);
    }
    .gear-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 290px;
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
      z-index: 200;
      overflow: hidden;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .gear-dropdown-header {
      padding: 0.8rem 1rem 0.5rem 1rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .dropdown-title {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }
    .gear-dropdown-body {
      padding: 0.4rem 0.5rem;
    }
    .dropdown-item {
      width: 100%;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }
    .dropdown-item:hover {
      background: #f8fafc;
    }
    .dropdown-item-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon--blue { background: #eff6ff; color: #2563eb; }
    .icon--cyan { background: #ecfeff; color: #0891b2; }
    .icon--amber { background: #fffbeb; color: #d97706; }
    .icon--red { background: #fef2f2; color: #dc2626; }
    .dropdown-item-text {
      display: flex;
      flex-direction: column;
    }
    .item-title {
      font-size: 0.825rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }
    .item-desc {
      font-size: 0.7rem;
      color: #64748b;
    }
    .gear-dropdown-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 0.25rem 0;
    }
    .gear-dropdown-footer {
      padding: 0.35rem 0.5rem 0.5rem 0.5rem;
      background: #fafafa;
    }
    .item--danger:hover {
      background: #fee2e2;
    }
    .item--danger:hover .item-title {
      color: #b91c1c;
    }

    /* MODALES */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: modalFade 0.2s ease;
    }
    @keyframes modalFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .modal-card--large {
      max-width: 760px;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .modal-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ecfeff;
      color: #0891b2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-badge--amber {
      background: #fffbeb;
      color: #d97706;
    }
    .modal-title-wrap h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .modal-title-wrap p {
      font-size: 0.8rem;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .modal-close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .modal-close-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.85rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }
    .feedback-alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.825rem;
      font-weight: 600;
    }
    .alert--success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn {
      padding: 0.55rem 1.2rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-secondary {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #475569;
    }
    .btn-secondary:hover {
      background: #f1f5f9;
    }
    .btn-primary {
      background: #0891b2;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0e7490;
    }

    /* TABLA DE AUDITORÍA */
    .modal-table-wrap {
      max-height: 380px;
      overflow-y: auto;
      padding: 0;
    }
    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
    }
    .audit-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 700;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    .audit-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-xs { font-size: 0.75rem; color: #64748b; }
    .role-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .badge-success {
      background: #dcfce7;
      color: #15803d;
    }
    .badge-danger {
      background: #fee2e2;
      color: #b91c1c;
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  ui = inject(UiStateService);
  private router = inject(Router);

  // Estados interactivos
  isSearchFocused = signal(false);
  isGearOpen = signal(false);
  showUserModal = signal(false);
  showHistoryModal = signal(false);
  showReportModal = signal(false);

  userModalSuccess = signal(false);
  reportModalSuccess = signal(false);

  searchQuery = '';

  // Formulario nuevo usuario
  newUser = {
    name: '',
    username: '',
    email: '',
    role: 'Operario',
    password: ''
  };

  // Formulario reporte
  bugReport = {
    station: 'Materia Prima - Ingreso',
    urgency: 'Media',
    description: ''
  };

  // Historial de accesos
  loginHistory = [
    { user: 'admin', role: 'ADMIN', timestamp: 'Hoy 08:30:12 AM', ip: '192.168.1.104', device: 'Chrome / Windows', status: 'Éxito' },
    { user: 'operador_lab', role: 'OPERARIO', timestamp: 'Hoy 07:45:00 AM', ip: '192.168.1.112', device: 'Firefox / Linux', status: 'Éxito' },
    { user: 'calidad_qc', role: 'QA_CHIEF', timestamp: 'Ayer 05:14:22 PM', ip: '192.168.1.120', device: 'Chrome / Windows', status: 'Éxito' },
    { user: 'admin', role: 'ADMIN', timestamp: 'Ayer 02:00:15 PM', ip: '192.168.1.104', device: 'Chrome / Windows', status: 'Éxito' },
    { user: 'invitado', role: 'GUEST', timestamp: '04/11/2026 10:20 AM', ip: '192.168.1.199', device: 'Edge / Windows', status: 'Contraseña errónea' },
  ];

  // Catálogo completo de páginas para búsqueda rápida
  allPages: PageItem[] = [
    { title: 'Panel Principal (Inicio)', category: 'Inicio & KPIs', path: '/trazabilidad/inicio', iconType: 'home' },
    { title: 'Ingreso Materia Prima - Llenar formato', category: 'Estaciones / Materias Primas', path: '/trazabilidad/estaciones/materia-prima/ingreso/formato', iconType: 'form' },
    { title: 'Ingreso Materia Prima - Ver registros', category: 'Estaciones / Materias Primas', path: '/trazabilidad/estaciones/materia-prima/ingreso/registros', iconType: 'list' },
    { title: 'Consumo Materia Prima - Llenar formato', category: 'Estaciones / Materias Primas', path: '/trazabilidad/estaciones/materia-prima/consumo/formato', iconType: 'form' },
    { title: 'Consumo Materia Prima - Ver registros', category: 'Estaciones / Materias Primas', path: '/trazabilidad/estaciones/materia-prima/consumo/registros', iconType: 'list' },
    { title: 'Inventario y Stock de Materias Primas', category: 'Estaciones / Materias Primas', path: '/trazabilidad/estaciones/materia-prima/inventario', iconType: 'box' },
    { title: 'Fabricación - Llenar formato de proceso', category: 'Estaciones / Fabricación', path: '/trazabilidad/estaciones/fabricacion/formato', iconType: 'form' },
    { title: 'Fabricación - Ver registros de producción', category: 'Estaciones / Fabricación', path: '/trazabilidad/estaciones/fabricacion/registros', iconType: 'list' },
    { title: 'Control de Calidad - Llenar formato de análisis', category: 'Estaciones / Control Calidad', path: '/trazabilidad/estaciones/control-calidad/formato', iconType: 'form' },
    { title: 'Control de Calidad - Ver registros & COA', category: 'Estaciones / Control Calidad', path: '/trazabilidad/estaciones/control-calidad/registros', iconType: 'list' },
    { title: 'Trazabilidad 360° Integral de Proceso', category: 'Estaciones / Trazabilidad 360°', path: '/trazabilidad/estaciones/trazabilidad-360', iconType: 'search' },
    { title: 'Clientes - Registrar Nuevo Cliente', category: 'Módulo Comercial / Clientes', path: '/trazabilidad/comercial/clientes/formato', iconType: 'form' },
    { title: 'Clientes - Ver Directorio & Registros', category: 'Módulo Comercial / Clientes', path: '/trazabilidad/comercial/clientes/registros', iconType: 'list' },
    { title: 'Productos - Registrar Fórmula & Producto', category: 'Módulo Comercial / Productos', path: '/trazabilidad/comercial/productos/formato', iconType: 'form' },
    { title: 'Productos - Catálogo & Fórmulas Maestras', category: 'Módulo Comercial / Productos', path: '/trazabilidad/comercial/productos/registros', iconType: 'list' },
    { title: 'Pedidos - Registrar Orden de Pedido', category: 'Módulo Comercial / Pedidos', path: '/trazabilidad/comercial/pedidos/formato', iconType: 'form' },
    { title: 'Pedidos - Gestión de Órdenes & Salidas', category: 'Módulo Comercial / Pedidos', path: '/trazabilidad/comercial/pedidos/registros', iconType: 'list' },
  ];

  filteredPages = signal<PageItem[]>(this.allPages);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-box-container')) {
      this.isSearchFocused.set(false);
    }
    if (!target.closest('.settings-menu-container')) {
      this.isGearOpen.set(false);
    }
  }

  filterPages() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredPages.set(this.allPages);
      return;
    }
    const filtered = this.allPages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    this.filteredPages.set(filtered);
  }

  selectPage(path: string) {
    this.isSearchFocused.set(false);
    this.searchQuery = '';
    this.router.navigateByUrl(path);
  }

  toggleGearMenu() {
    this.isGearOpen.update(v => !v);
  }

  openUserModal() {
    this.isGearOpen.set(false);
    this.userModalSuccess.set(false);
    this.showUserModal.set(true);
  }

  openHistoryModal() {
    this.isGearOpen.set(false);
    this.showHistoryModal.set(true);
  }

  openReportModal() {
    this.isGearOpen.set(false);
    this.reportModalSuccess.set(false);
    this.bugReport = {
      station: 'Materia Prima - Ingreso',
      urgency: 'Media',
      description: ''
    };
    this.showReportModal.set(true);
  }

  saveUser() {
    if (!this.newUser.name || !this.newUser.username) return;
    this.userModalSuccess.set(true);
    setTimeout(() => {
      this.showUserModal.set(false);
      this.userModalSuccess.set(false);
      this.newUser = { name: '', username: '', email: '', role: 'Operario', password: '' };
    }, 1200);
  }

  submitReport() {
    if (!this.bugReport.description) return;
    this.reportModalSuccess.set(true);
    setTimeout(() => {
      this.showReportModal.set(false);
      this.reportModalSuccess.set(false);
    }, 1400);
  }

  logout() {
    this.isGearOpen.set(false);
    this.auth.logout();
  }
}
