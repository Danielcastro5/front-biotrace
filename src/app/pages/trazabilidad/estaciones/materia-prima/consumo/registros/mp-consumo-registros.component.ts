import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, ConsumoMpRecord } from '../../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-mp-consumo-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER OFICIAL -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon station-badge-icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-MP-02</span>
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Consumo Materia Prima — Registros</h1>
            <p class="station-desc">Historial de dosificaciones y pesadas en reactores vinculadas a órdenes de pedido.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/formato" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Llenar formato de consumo</span>
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
              placeholder="Buscar por código de consumo, pedido, lote o producto..."
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

      <!-- TABLA DE REGISTROS DE CONSUMO -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código Consumo</th>
                <th>Pedido Vinculado</th>
                <th>Lote Asignado</th>
                <th>Producto & Cliente</th>
                <th>Reactor / Equipo</th>
                <th>Fecha</th>
                <th>Insumos Dosificados</th>
                <th>Operador</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag">{{ reg.codigoConsumo }}</span>
                </td>
                <td>
                  <span class="code-tag" style="background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">
                    {{ reg.numeroPedido }}
                  </span>
                </td>
                <td>
                  <span class="code-tag">{{ reg.loteAsignado }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <strong style="color: #0f172a;">{{ reg.productoNombre }}</strong>
                    <span style="font-size: 0.72rem; color: #64748b;">{{ reg.clienteNombre }}</span>
                  </div>
                </td>
                <td>{{ reg.reactor }}</td>
                <td>{{ reg.fechaConsumo }}</td>
                <td>
                  <span class="status-badge status-badge--info">
                    {{ reg.detalles.length }} materias primas
                  </span>
                </td>
                <td><strong>{{ reg.operador }}</strong></td>
                <td>
                  <span class="status-badge status-badge--success">
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver balance detallado">
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

    <!-- MODAL DETALLE DE CONSUMO (DESGLOSE COMPLETO) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge station-badge-icon--blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <h3>Balance de Pesada & Dosificación — {{ selectedItem()?.codigoConsumo }}</h3>
              <p>Lote Asignado: <strong>{{ selectedItem()?.loteAsignado }}</strong> • {{ selectedItem()?.productoNombre }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <!-- METADATA GRID -->
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">PEDIDO COMERCIAL</span>
              <span class="meta-value">{{ item.numeroPedido }}</span>
              <span class="meta-sub">{{ item.clienteNombre }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">REACTOR / EQUIPO</span>
              <span class="meta-value">{{ item.reactor }}</span>
              <span class="meta-sub">Fecha: {{ item.fechaConsumo }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">OPERADOR DE PESADA</span>
              <span class="meta-value">{{ item.operador }}</span>
              <span class="meta-sub">Doble verificación BPM</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ESTADO DE BALANCE</span>
              <span class="meta-value" style="color: #16a34a;">{{ item.estado }}</span>
              <span class="meta-sub">Sin desviación de pesada</span>
            </div>
          </div>

          <!-- TABLA DE DESGLOSE DE MATERIAS PRIMAS DOSIFICADAS -->
          <div class="modal-section">
            <h4 class="modal-section-title">Materias Primas Dosificadas en Reactor</h4>
            <table class="modal-subtable">
              <thead>
                <tr>
                  <th>Materia Prima</th>
                  <th>Lote Descontado</th>
                  <th style="text-align: right;">Teórico (Kg)</th>
                  <th style="text-align: right;">Real Pesado (Kg)</th>
                  <th>Balanza Calibrada</th>
                  <th style="text-align: center;">Conformidad</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let det of item.detalles">
                  <td><strong>{{ det.materiaPrima }}</strong></td>
                  <td><span class="code-tag">{{ det.loteMp }}</span></td>
                  <td style="text-align: right; color: #64748b;">{{ det.programadoKg.toFixed(2) }} {{ det.unidad }}</td>
                  <td style="text-align: right; font-weight: 800; color: #0891b2;">{{ det.realConsumidoKg.toFixed(2) }} {{ det.unidad }}</td>
                  <td style="font-size: 0.75rem; color: #475569;">{{ det.balanza }}</td>
                  <td style="text-align: center;">
                    <span class="status-badge status-badge--success">✓ Conforme</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Observaciones de Proceso</h4>
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

    <!-- MODAL EDITAR CONSUMO -->
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
              <h3>Editar Registro de Consumo</h3>
              <p>Código: {{ editItem()?.codigoConsumo }}</p>
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
        <h4>¿Eliminar registro de consumo?</h4>
        <p>Está a punto de eliminar el consumo <strong>{{ itemToDelete()?.codigoConsumo }}</strong> ({{ itemToDelete()?.productoNombre }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../../shared/styles/registros-common.css']
})
export class MpConsumoRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroReactor = 'TODOS';
  filtroFecha = '';

  selectedItem = signal<ConsumoMpRecord | null>(null);
  editItem = signal<ConsumoMpRecord | null>(null);
  itemToDelete = signal<ConsumoMpRecord | null>(null);

  filteredRecords(): ConsumoMpRecord[] {
    const list = this.data.consumosMp();
    const term = this.searchTerm.toLowerCase().trim();
    const reactor = this.filtroReactor;
    const fecha = this.filtroFecha;

    return list.filter(r => {
      const matchText = !term ||
        r.codigoConsumo.toLowerCase().includes(term) ||
        r.numeroPedido.toLowerCase().includes(term) ||
        r.loteAsignado.toLowerCase().includes(term) ||
        r.productoNombre.toLowerCase().includes(term) ||
        r.clienteNombre.toLowerCase().includes(term) ||
        r.operador.toLowerCase().includes(term);

      const matchReactor = reactor === 'TODOS' || r.reactor.includes(reactor);
      const matchFecha = !fecha || r.fechaConsumo === fecha;

      return matchText && matchReactor && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroReactor = 'TODOS';
    this.filtroFecha = '';
  }

  verDetalle(item: ConsumoMpRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: ConsumoMpRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateConsumoMp(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: ConsumoMpRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteConsumoMp(it.id);
      this.itemToDelete.set(null);
    }
  }
}
