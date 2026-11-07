import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, ClienteRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-clientes-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-CLI-01</span>
              <span class="station-cat-badge">Módulo Comercial & Clientes</span>
            </div>
            <h1 class="station-title">Directorio de Clientes — Registros</h1>
            <p class="station-desc">Cuentas comerciales homologadas, datos fiscales y órdenes asociadas.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/clientes/formato" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Registrar nuevo cliente</span>
        </a>
      </header>

      <div class="filter-card">
        <div class="filter-grid">
          <div class="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="filter-input"
              placeholder="Buscar por razón social, NIT, contacto o ciudad..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroCiudad">
              <option value="TODOS">Todas las ciudades</option>
              <option value="Medellín">Medellín</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Cali">Cali</option>
            </select>

            <button
              *ngIf="searchTerm || filtroCiudad !== 'TODOS'"
              type="button"
              class="btn-clear"
              (click)="limpiarFiltros()"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Razón Social</th>
                <th>NIT</th>
                <th>Contacto Principal</th>
                <th>Correo Electrónico</th>
                <th>Ciudad</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td><span class="code-tag">{{ reg.codigo }}</span></td>
                <td>
                  <strong style="color: #0f172a;">{{ reg.razonSocial }}</strong>
                </td>
                <td><span class="code-tag">{{ reg.nit }}</span></td>
                <td>{{ reg.contacto }}</td>
                <td style="color: #0891b2;">{{ reg.correo }}</td>
                <td>{{ reg.ciudad }}</td>
                <td>
                  <span class="code-tag" style="background: #eff6ff; color: #1e40af; border-color: #dbeafe;">
                    {{ reg.categoria }}
                  </span>
                </td>
                <td>
                  <span class="status-badge status-badge--success">
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver detalle de cuenta">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--edit" (click)="editarRegistro(reg)" title="Editar cliente">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--delete" (click)="confirmarEliminar(reg)" title="Eliminar cliente">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE DE CLIENTE -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3>Cuenta Comercial — {{ selectedItem()?.razonSocial }}</h3>
              <p>NIT: {{ selectedItem()?.nit }} • Código: {{ selectedItem()?.codigo }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">CONTACTO COMERCIAL</span>
              <span class="meta-value">{{ item.contacto }}</span>
              <span class="meta-sub">{{ item.telefono }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">CORREO ELECTRÓNICO</span>
              <span class="meta-value">{{ item.correo }}</span>
              <span class="meta-sub">Facturación electrónica</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">CIUDAD Y DEPARTAMENTO</span>
              <span class="meta-value">{{ item.ciudad }}</span>
              <span class="meta-sub">{{ item.direccion }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ESTADO DE CUENTA</span>
              <span class="meta-value" style="color: #16a34a;">{{ item.estado }}</span>
              <span class="meta-sub">{{ item.categoria }}</span>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Dirección de Despacho Autorizada</h4>
            <div class="modal-obs-card">
              {{ item.direccion }}, {{ item.ciudad }}.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR CLIENTE -->
    <div class="modal-backdrop" *ngIf="editItem()" (click)="editItem.set(null)">
      <div class="modal-sheet" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge" style="background: #eff6ff; color: #2563eb;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <div>
              <h3>Editar Cliente Comercial</h3>
              <p>{{ editItem()?.razonSocial }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Persona de Contacto</label>
              <input type="text" [(ngModel)]="item.contacto" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Teléfono</label>
              <input type="text" [(ngModel)]="item.telefono" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Dirección de Despacho</label>
              <input type="text" [(ngModel)]="item.direccion" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="editItem.set(null)">Cancelar</button>
          <button type="button" class="btn btn-primary" (click)="guardarEdicion()">Guardar Cambios</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <div class="modal-backdrop" *ngIf="itemToDelete()" (click)="itemToDelete.set(null)">
      <div class="modal-confirm" (click)="$event.stopPropagation()">
        <div class="modal-confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <h4>¿Eliminar cuenta de cliente?</h4>
        <p>Está a punto de eliminar a <strong>{{ itemToDelete()?.razonSocial }}</strong> (NIT {{ itemToDelete()?.nit }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class ClientesRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroCiudad = 'TODOS';

  selectedItem = signal<ClienteRecord | null>(null);
  editItem = signal<ClienteRecord | null>(null);
  itemToDelete = signal<ClienteRecord | null>(null);

  filteredRecords(): ClienteRecord[] {
    const list = this.data.clientes();
    const term = this.searchTerm.toLowerCase().trim();
    const ciudad = this.filtroCiudad;

    return list.filter(r => {
      const matchText = !term ||
        r.razonSocial.toLowerCase().includes(term) ||
        r.nit.toLowerCase().includes(term) ||
        r.contacto.toLowerCase().includes(term) ||
        r.correo.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term);

      const matchCiudad = ciudad === 'TODOS' || r.ciudad.includes(ciudad);

      return matchText && matchCiudad;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroCiudad = 'TODOS';
  }

  verDetalle(item: ClienteRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: ClienteRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateCliente(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: ClienteRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteCliente(it.id);
      this.itemToDelete.set(null);
    }
  }
}
