import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, FabricacionRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-fabricacion-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER OFICIAL -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon station-badge-icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge" style="color: #9333ea; background: #faf5ff; border-color: #e9d5ff;">EST-03</span>
              <span class="station-cat-badge">Manufactura & Formulación</span>
            </div>
            <h1 class="station-title">Fabricación del Producto — Registros</h1>
            <p class="station-desc">Historial de órdenes procesadas en reactores, verificación de despeje de línea y parámetros de agitación.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/fabricacion/formato" class="btn btn-primary" style="background: #9333ea;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Llenar formato de fabricación</span>
        </a>
      </header>

      <!-- BARRA DE FILTROS -->
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
              placeholder="Buscar por lote, pedido, producto u operador..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroReactor">
              <option value="TODOS">Todos los reactores</option>
              <option value="Reactor R-101">Reactor R-101</option>
              <option value="Reactor R-102">Reactor R-102</option>
              <option value="Marmita M-01">Marmita M-01</option>
            </select>

            <input type="date" class="filter-date" [(ngModel)]="filtroFecha" />

            <button
              *ngIf="searchTerm || filtroReactor !== 'TODOS' || filtroFecha"
              type="button"
              class="btn-clear"
              (click)="limpiarFiltros()"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- TABLA DE REGISTROS -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lote Fabricado</th>
                <th>Pedido Vinculado</th>
                <th>Producto & Marca</th>
                <th>Reactor</th>
                <th>Tamaño Lote</th>
                <th>Despeje BPM</th>
                <th>Fases</th>
                <th>Operador</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag" style="background: #faf5ff; color: #7e22ce; border-color: #e9d5ff;">
                    {{ reg.lote }}
                  </span>
                </td>
                <td>
                  <span class="code-tag">{{ reg.numeroPedido }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <strong style="color: #0f172a;">{{ reg.nombreProducto }}</strong>
                    <span style="font-size: 0.72rem; color: #64748b;">{{ reg.marca }}</span>
                  </div>
                </td>
                <td>{{ reg.reactor }}</td>
                <td><strong>{{ reg.tamanoLoteKg }} Kg</strong></td>
                <td>
                  <span class="status-badge status-badge--success">
                    ✓ Conforme (7/7)
                  </span>
                </td>
                <td>
                  <span class="code-tag">{{ reg.totalPasos }} Fases</span>
                </td>
                <td><strong>{{ reg.operador }}</strong></td>
                <td>
                  <span class="status-badge status-badge--info">
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver fases completas">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--edit" (click)="editarRegistro(reg)" title="Editar registro">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--delete" (click)="confirmarEliminar(reg)" title="Eliminar registro">
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

    <!-- MODAL DETALLE DE FABRICACIÓN (RICO Y NO PLANO) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge station-badge-icon--purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h3>Ficha Técnica de Manufactura — Lote {{ selectedItem()?.lote }}</h3>
              <p>{{ selectedItem()?.nombreProducto }} • Orden: {{ selectedItem()?.numeroPedido }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <!-- METADATA GRID -->
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">REACTOR / EQUIPO</span>
              <span class="meta-value">{{ item.reactor }}</span>
              <span class="meta-sub">Capacidad y agitación variable</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">TAMAÑO DEL LOTE</span>
              <span class="meta-value">{{ item.tamanoLoteKg }} Kg / Litros</span>
              <span class="meta-sub">Fecha: {{ item.fecha }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">DESPEJE DE LÍNEA</span>
              <span class="meta-value" style="color: #16a34a;">Conforme (7/7)</span>
              <span class="meta-sub">Área sanitizada y balanzas verificadas</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">RESPONSABLES</span>
              <span class="meta-value">{{ item.operador }}</span>
              <span class="meta-sub">Supervisor: {{ item.supervisor }}</span>
            </div>
          </div>

          <!-- TABLA DE FASES REGISTRADAS -->
          <div class="modal-section">
            <h4 class="modal-section-title">Fases y Parámetros de Mezcla Registrados</h4>
            <table class="modal-subtable">
              <thead>
                <tr>
                  <th style="width: 60px;">Fase</th>
                  <th>Procedimiento Detallado</th>
                  <th style="width: 100px;">RPM</th>
                  <th style="width: 100px;">Tiempo</th>
                  <th style="width: 110px;">Temp.</th>
                  <th style="width: 120px;">Operador</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of item.pasos">
                  <td><strong>#{{ p.pasoNumero }}</strong></td>
                  <td>{{ p.procedimiento }}</td>
                  <td><span class="code-tag">{{ p.rpm }}</span></td>
                  <td><strong>{{ p.tiempo }}</strong></td>
                  <td>{{ p.temperatura }}</td>
                  <td>{{ p.realizadoPor }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Observaciones Técnicas de Fin de Proceso</h4>
            <div class="modal-obs-card">
              {{ item.observaciones }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR FABRICACIÓN -->
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
              <h3>Editar Orden de Fabricación</h3>
              <p>Lote: {{ editItem()?.lote }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Reactor</label>
              <input type="text" [(ngModel)]="item.reactor" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Operador</label>
              <input type="text" [(ngModel)]="item.operador" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Observaciones</label>
              <textarea [(ngModel)]="item.observaciones" rows="3" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;"></textarea>
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
        <h4>¿Eliminar orden de fabricación?</h4>
        <p>Está a punto de eliminar el registro de manufactura del lote <strong>{{ itemToDelete()?.lote }}</strong> ({{ itemToDelete()?.nombreProducto }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class FabricacionRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroReactor = 'TODOS';
  filtroFecha = '';

  selectedItem = signal<FabricacionRecord | null>(null);
  editItem = signal<FabricacionRecord | null>(null);
  itemToDelete = signal<FabricacionRecord | null>(null);

  filteredRecords(): FabricacionRecord[] {
    const list = this.data.fabricaciones();
    const term = this.searchTerm.toLowerCase().trim();
    const reactor = this.filtroReactor;
    const fecha = this.filtroFecha;

    return list.filter(r => {
      const matchText = !term ||
        r.lote.toLowerCase().includes(term) ||
        r.numeroPedido.toLowerCase().includes(term) ||
        r.nombreProducto.toLowerCase().includes(term) ||
        r.operador.toLowerCase().includes(term);

      const matchReactor = reactor === 'TODOS' || r.reactor.includes(reactor);
      const matchFecha = !fecha || r.fecha === fecha;

      return matchText && matchReactor && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroReactor = 'TODOS';
    this.filtroFecha = '';
  }

  verDetalle(item: FabricacionRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: FabricacionRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateFabricacion(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: FabricacionRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteFabricacion(it.id);
      this.itemToDelete.set(null);
    }
  }
}
