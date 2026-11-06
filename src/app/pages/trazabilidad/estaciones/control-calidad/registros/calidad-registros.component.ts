import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, CalidadRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-calidad-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER OFICIAL -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon station-badge-icon--emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge" style="color: #16a34a; background: #f0fdf4; border-color: #bbf7d0;">EST-04</span>
              <span class="station-cat-badge">Aseguramiento & Control de Calidad (QC/QA)</span>
            </div>
            <h1 class="station-title">Control de Calidad — Registros & COA</h1>
            <p class="station-desc">Histórico de dictámenes oficiales de liberación físico-química y emisión de certificados de calidad.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/control-calidad/formato" class="btn btn-primary" style="background: #16a34a;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Llenar formato de calidad</span>
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
              placeholder="Buscar por lote, COA, producto o analista..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroDictamen">
              <option value="TODOS">Todos los dictámenes</option>
              <option value="APROBADO / LIBERADO">Aprobados / Liberados</option>
              <option value="EN CUARENTENA">En Cuarentena</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>

            <input type="date" class="filter-date" [(ngModel)]="filtroFecha" />

            <button
              *ngIf="searchTerm || filtroDictamen !== 'TODOS' || filtroFecha"
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
                <th>Lote</th>
                <th>Certificado COA</th>
                <th>Pedido Vinculado</th>
                <th>Producto & Marca</th>
                <th>Fecha Análisis</th>
                <th>Ensayos</th>
                <th>Analista QC</th>
                <th>Dictamen Oficial</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag">{{ reg.lote }}</span>
                </td>
                <td>
                  <span class="code-tag" style="background: #f0fdf4; color: #166534; border-color: #bbf7d0;">
                    {{ reg.numeroCoa }}
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
                <td>{{ reg.fecha }}</td>
                <td>
                  <span class="status-badge status-badge--success">
                    ✓ {{ reg.parametros.length }}/{{ reg.parametros.length }} Conformes
                  </span>
                </td>
                <td><strong>{{ reg.analista }}</strong></td>
                <td>
                  <span
                    class="status-badge"
                    [class.status-badge--success]="reg.dictamen.includes('APROBADO')"
                    [class.status-badge--warning]="reg.dictamen.includes('CUARENTENA')"
                    [class.status-badge--danger]="reg.dictamen.includes('RECHAZADO')"
                  >
                    {{ reg.dictamen }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver Certificado COA">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
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

    <!-- MODAL CERTIFICADO DE ANÁLISIS COA OFICIAL (RICO Y COMPLETO) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge station-badge-icon--emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div>
              <h3>Certificado Oficial de Análisis (COA) — {{ selectedItem()?.numeroCoa }}</h3>
              <p>Lote: <strong>{{ selectedItem()?.lote }}</strong> • {{ selectedItem()?.nombreProducto }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <!-- METADATA GRID -->
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">PRODUCTO & MARCA</span>
              <span class="meta-value">{{ item.nombreProducto }}</span>
              <span class="meta-sub">{{ item.marca }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ORDEN DE PEDIDO</span>
              <span class="meta-value">{{ item.numeroPedido }}</span>
              <span class="meta-sub">Muestra: {{ item.tipoMuestra }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">FECHA DE LIBERACIÓN</span>
              <span class="meta-value">{{ item.fecha }}</span>
              <span class="meta-sub">Analista: {{ item.analista }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">DIRECCIÓN TÉCNICA</span>
              <span class="meta-value" style="color: #166534;">{{ item.firmadoPor }}</span>
              <span class="meta-sub">Validación farmacéutica</span>
            </div>
          </div>

          <!-- TABLA DE PARÁMETROS FÍSICO-QUÍMICOS -->
          <div class="modal-section">
            <h4 class="modal-section-title">Resultados de Ensayos Técnicos de Control</h4>
            <table class="modal-subtable">
              <thead>
                <tr>
                  <th>Parámetro Físico-Químico</th>
                  <th>Especificación Oficial</th>
                  <th>Resultado Obtenido</th>
                  <th style="text-align: center;">Conformidad</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of item.parametros">
                  <td><strong>{{ p.parametro }}</strong></td>
                  <td style="color: #64748b;">{{ p.especificacion }}</td>
                  <td><strong style="color: #0891b2;">{{ p.resultado }}</strong></td>
                  <td style="text-align: center;">
                    <span class="status-badge status-badge--success">✓ Conforme</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BANNER OFICIAL DE DICTAMEN -->
          <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 1rem 1.25rem;">
            <div style="font-size: 0.95rem; font-weight: 800; color: #166534; letter-spacing: 0.02em;">
              DICTAMEN TÉCNICO OFICIAL: {{ item.dictamen }}
            </div>
            <p style="font-size: 0.825rem; color: #14532d; margin: 4px 0 0 0;">
              {{ item.observaciones }}
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR CALIDAD -->
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
              <h3>Editar Registro de Calidad</h3>
              <p>Lote: {{ editItem()?.lote }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Dictamen</label>
              <select [(ngModel)]="item.dictamen" class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.5rem;">
                <option value="APROBADO / LIBERADO">APROBADO / LIBERADO</option>
                <option value="EN CUARENTENA">EN CUARENTENA</option>
                <option value="RECHAZADO">RECHAZADO</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Analista QC</label>
              <input type="text" [(ngModel)]="item.analista" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 8px; margin-top: 4px;" />
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
        <h4>¿Eliminar registro de calidad?</h4>
        <p>Está a punto de eliminar el certificado <strong>{{ itemToDelete()?.numeroCoa }}</strong> (Lote {{ itemToDelete()?.lote }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class CalidadRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroDictamen = 'TODOS';
  filtroFecha = '';

  selectedItem = signal<CalidadRecord | null>(null);
  editItem = signal<CalidadRecord | null>(null);
  itemToDelete = signal<CalidadRecord | null>(null);

  filteredRecords(): CalidadRecord[] {
    const list = this.data.calidadRegistros();
    const term = this.searchTerm.toLowerCase().trim();
    const dictamen = this.filtroDictamen;
    const fecha = this.filtroFecha;

    return list.filter(r => {
      const matchText = !term ||
        r.lote.toLowerCase().includes(term) ||
        r.numeroCoa.toLowerCase().includes(term) ||
        r.numeroPedido.toLowerCase().includes(term) ||
        r.nombreProducto.toLowerCase().includes(term) ||
        r.analista.toLowerCase().includes(term);

      const matchDictamen = dictamen === 'TODOS' || r.dictamen === dictamen;
      const matchFecha = !fecha || r.fecha === fecha;

      return matchText && matchDictamen && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroDictamen = 'TODOS';
    this.filtroFecha = '';
  }

  verDetalle(item: CalidadRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: CalidadRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateCalidad(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: CalidadRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteCalidad(it.id);
      this.itemToDelete.set(null);
    }
  }
}
