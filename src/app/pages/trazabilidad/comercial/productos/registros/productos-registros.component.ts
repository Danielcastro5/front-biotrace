import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, ProductoRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-productos-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-PROD-01</span>
              <span class="station-cat-badge">Catálogo & Fórmulas Magistrales</span>
            </div>
            <h1 class="station-title">Catálogo de Productos — Registros</h1>
            <p class="station-desc">Formulaciones galénicas autorizadas, códigos de producto y composición porcentual.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/productos/formato" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Registrar nuevo producto</span>
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
              placeholder="Buscar por nombre, código galénico o Invima..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroLinea">
              <option value="TODOS">Todas las líneas</option>
              <option value="BioTrace Derma Care">BioTrace Derma Care</option>
              <option value="BioTrace Barrier Repair">BioTrace Barrier Repair</option>
              <option value="BioTrace Natural Solutions">BioTrace Natural Solutions</option>
            </select>

            <button
              *ngIf="searchTerm || filtroLinea !== 'TODOS'"
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
                <th>Código Galénico</th>
                <th>Nombre del Producto</th>
                <th>Línea / Marca</th>
                <th>Presentación</th>
                <th>Registro Invima</th>
                <th>Lote Estándar</th>
                <th>Ingredientes</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td><span class="code-tag">{{ reg.codigo }}</span></td>
                <td>
                  <strong style="color: #0f172a;">{{ reg.nombre }}</strong>
                </td>
                <td>{{ reg.linea }}</td>
                <td style="font-size: 0.78rem; color: #475569;">{{ reg.presentacion }}</td>
                <td><span class="code-tag">{{ reg.registroInvima }}</span></td>
                <td><strong>{{ reg.tamanoLoteEstandar }} Kg</strong></td>
                <td>
                  <span class="code-tag" style="background: #faf5ff; color: #7e22ce; border-color: #e9d5ff;">
                    {{ reg.formula.length }} materias primas
                  </span>
                </td>
                <td>
                  <span class="status-badge status-badge--success">
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver fórmula galénica completa">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--edit" (click)="editarRegistro(reg)" title="Editar producto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--delete" (click)="confirmarEliminar(reg)" title="Eliminar producto">
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

    <!-- MODAL DETALLE DE PRODUCTO Y FÓRMULA (DESGLOSE COMPLETO) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              </svg>
            </div>
            <div>
              <h3>Ficha Técnica & Fórmula — {{ selectedItem()?.nombre }}</h3>
              <p>Código: {{ selectedItem()?.codigo }} • {{ selectedItem()?.linea }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">PRESENTACIÓN COMERCIAL</span>
              <span class="meta-value">{{ item.presentacion }}</span>
              <span class="meta-sub">Envasado hermético</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">REGISTRO INVIMA</span>
              <span class="meta-value">{{ item.registroInvima }}</span>
              <span class="meta-sub">Vigente</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">TAMAÑO LOTE ESTÁNDAR</span>
              <span class="meta-value">{{ item.tamanoLoteEstandar }} Kg</span>
              <span class="meta-sub">Base de formulación</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ESTADO DE FÓRMULA</span>
              <span class="meta-value" style="color: #16a34a;">{{ item.estado }}</span>
              <span class="meta-sub">Homologada para reactores</span>
            </div>
          </div>

          <!-- TABLA DE FÓRMULA GALÉNICA -->
          <div class="modal-section">
            <h4 class="modal-section-title">Composición y Materias Primas de la Fórmula</h4>
            <table class="modal-subtable">
              <thead>
                <tr>
                  <th>Componente / Principio Activo</th>
                  <th>Lote Sugerido en Bodega</th>
                  <th style="text-align: right;">% en Fórmula</th>
                  <th style="text-align: right;">Cantidad por Lote Estándar</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of item.formula">
                  <td><strong>{{ f.nombreMateriaPrima }}</strong></td>
                  <td><span class="code-tag">{{ f.loteSugerido }}</span></td>
                  <td style="text-align: right; font-weight: 700; color: #0891b2;">{{ f.porcentaje }}%</td>
                  <td style="text-align: right; font-weight: 800;">{{ f.cantidadPorLote }} {{ f.unidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR PRODUCTO -->
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
              <h3>Editar Producto Cosmético</h3>
              <p>{{ editItem()?.nombre }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Nombre Comercial</label>
              <input type="text" [(ngModel)]="item.nombre" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Presentación</label>
              <input type="text" [(ngModel)]="item.presentacion" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Lote Estándar (Kg)</label>
              <input type="number" [(ngModel)]="item.tamanoLoteEstandar" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Estado</label>
              <select [(ngModel)]="item.estado" class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.5rem;">
                <option value="Activo">Activo</option>
                <option value="En revisión">En revisión</option>
              </select>
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
        <h4>¿Eliminar producto del catálogo?</h4>
        <p>Está a punto de eliminar <strong>{{ itemToDelete()?.nombre }}</strong> (Código {{ itemToDelete()?.codigo }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class ProductosRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroLinea = 'TODOS';

  selectedItem = signal<ProductoRecord | null>(null);
  editItem = signal<ProductoRecord | null>(null);
  itemToDelete = signal<ProductoRecord | null>(null);

  filteredRecords(): ProductoRecord[] {
    const list = this.data.productos();
    const term = this.searchTerm.toLowerCase().trim();
    const linea = this.filtroLinea;

    return list.filter(r => {
      const matchText = !term ||
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        r.registroInvima.toLowerCase().includes(term) ||
        r.linea.toLowerCase().includes(term);

      const matchLinea = linea === 'TODOS' || r.linea === linea;

      return matchText && matchLinea;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroLinea = 'TODOS';
  }

  verDetalle(item: ProductoRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: ProductoRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateProducto(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: ProductoRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteProducto(it.id);
      this.itemToDelete.set(null);
    }
  }
}
