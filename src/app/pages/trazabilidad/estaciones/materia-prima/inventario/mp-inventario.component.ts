import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TraceabilityDataService,
  InventarioLoteMp,
  MovimientoConsumoItem,
  IngresoMpRecord
} from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-mp-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- 1. ENCABEZADO MAESTRO DE ESTACIÓN -->
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
              <span class="station-code-badge">EST-MP-03</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Inventario y Stock de Materias Primas</h1>
            <p class="station-desc">
              Trazabilidad en tiempo real: Entradas por lote (Ingreso) y deducción automática por formulación en reactor (Consumo).
            </p>
          </div>
        </div>

        <div class="station-header-actions">
          <button type="button" (click)="exportarCsv()" class="btn btn-secondary" title="Exportar inventario a Excel/CSV">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Exportar CSV</span>
          </button>

          <a routerLink="/trazabilidad/estaciones/materia-prima/ingreso/formato" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Ingreso</span>
          </a>

          <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/formato" class="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Registrar Consumo</span>
          </a>
        </div>
      </header>

      <!-- FEEDBACK BANNER -->
      <div *ngIf="feedbackMessage()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>{{ feedbackMessage() }}</strong>
        </div>
      </div>

      <!-- 2. TARJETAS KPI DE STOCK GENERAL -->
      <section class="kpi-grid">
        <!-- KPI 1: Stock Total Disponible -->
        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon--cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">STOCK TOTAL DISPONIBLE</span>
            <div class="kpi-value text-cyan">{{ data.inventarioKpis().totalStockDisponibleKg.toLocaleString('es-CO') }} <span class="kpi-unit">Kg/L</span></div>
            <span class="kpi-sub">En existencias activas de bodega</span>
          </div>
        </div>

        <!-- KPI 2: Total Ingresado -->
        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">TOTAL INGRESADO HISTÓRICO</span>
            <div class="kpi-value">{{ data.inventarioKpis().totalIngresadoKg.toLocaleString('es-CO') }} <span class="kpi-unit">Kg/L</span></div>
            <span class="kpi-sub">{{ data.inventarioKpis().totalLotes }} lotes recibidos</span>
          </div>
        </div>

        <!-- KPI 3: Total Consumido -->
        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">TOTAL CONSUMIDO EN REACTORES</span>
            <div class="kpi-value text-purple">{{ data.inventarioKpis().totalConsumidoKg.toLocaleString('es-CO') }} <span class="kpi-unit">Kg/L</span></div>
            <span class="kpi-sub">Dosificado en mezclas galénicas</span>
          </div>
        </div>

        <!-- KPI 4: Lotes Críticos (<= 20%) -->
        <div class="kpi-card" [class.kpi-card--warn]="data.inventarioKpis().lotesBajoStock > 0">
          <div class="kpi-icon-box kpi-icon--amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">CRÍTICOS (≤ 20% RESTANTE)</span>
            <div class="kpi-value text-amber">{{ data.inventarioKpis().lotesBajoStock }} <span class="kpi-unit">lotes</span></div>
            <span class="kpi-sub">Próximos a requerir orden de compra</span>
          </div>
        </div>

        <!-- KPI 5: Lotes Agotados (0 Kg) -->
        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon--red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">LOTES AGOTADOS (0 KG)</span>
            <div class="kpi-value text-red">{{ data.inventarioKpis().lotesAgotados }} <span class="kpi-unit">lotes</span></div>
            <span class="kpi-sub">Sin existencias / No seleccionables</span>
          </div>
        </div>
      </section>

      <!-- 3. BARRA DE FILTROS & BÚSQUEDA REACTIVA -->
      <section class="filter-card">
        <div class="filter-controls-row">
          <!-- Búsqueda en texto -->
          <div class="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar por lote interno, materia prima, proveedor o código..."
              class="search-input-field"
            />
          </div>

          <!-- Filtros de Estado de Stock -->
          <div class="status-pills-group">
            <button
              type="button"
              class="pill-filter-btn"
              [class.pill-filter-btn--active]="filtroEstado() === 'TODOS'"
              (click)="filtroEstado.set('TODOS')"
            >
              Todos ({{ data.inventarioKpis().totalLotes }})
            </button>

            <button
              type="button"
              class="pill-filter-btn pill-filter-btn--available"
              [class.pill-filter-btn--active]="filtroEstado() === 'DISPONIBLE'"
              (click)="filtroEstado.set('DISPONIBLE')"
            >
              <span class="status-dot status-dot--green"></span>
              Óptimo >20% ({{ data.inventarioKpis().lotesDisponibles }})
            </button>

            <button
              type="button"
              class="pill-filter-btn pill-filter-btn--low"
              [class.pill-filter-btn--active]="filtroEstado() === 'STOCK_BAJO'"
              (click)="filtroEstado.set('STOCK_BAJO')"
            >
              <span class="status-dot status-dot--amber"></span>
              Crítico ≤20% ({{ data.inventarioKpis().lotesBajoStock }})
            </button>

            <button
              type="button"
              class="pill-filter-btn pill-filter-btn--empty"
              [class.pill-filter-btn--active]="filtroEstado() === 'AGOTADO'"
              (click)="filtroEstado.set('AGOTADO')"
            >
              <span class="status-dot status-dot--red"></span>
              Agotados 0 Kg ({{ data.inventarioKpis().lotesAgotados }})
            </button>
          </div>
        </div>
      </section>

      <!-- 4. TABLA PRINCIPAL DE INVENTARIO Y SALDOS -->
      <section class="table-card">
        <div class="table-card-header">
          <div class="table-header-left">
            <h3 class="table-header-title">Existencias de Materia Prima por Lote</h3>
            <span class="count-badge">{{ lotesFiltrados().length }} lotes</span>
          </div>
          <div class="table-header-legend">
            <span class="legend-item"><span class="legend-color legend-color--green"></span> >20% Óptimo</span>
            <span class="legend-item"><span class="legend-color legend-color--amber"></span> ≤20% Crítico</span>
            <span class="legend-item"><span class="legend-color legend-color--red"></span> 0% Agotado</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width: 140px;">Lote Interno</th>
                <th style="min-width: 220px;">Materia Prima / Insumo</th>
                <th style="min-width: 180px;">Proveedor / Fabricante</th>
                <th style="min-width: 120px;">Recepción</th>
                <th style="width: 120px; text-align: right;">Ingresado</th>
                <th style="width: 120px; text-align: right;">Consumido</th>
                <th style="width: 140px; text-align: right;">Saldo Disponible</th>
                <th style="min-width: 160px;">% Restante</th>
                <th style="min-width: 140px; text-align: center;">Estado Stock</th>
                <th style="width: 100px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of lotesFiltrados()" [class.row--exhausted]="row.estadoStock === 'AGOTADO'">
                <td>
                  <span class="code-badge code-badge--cyan font-mono font-bold">{{ row.loteInterno }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <strong style="color: #0f172a; font-size: 0.88rem;">{{ row.producto }}</strong>
                    <span style="font-size: 0.72rem; color: #64748b; font-family: monospace;">{{ row.codigoInsumo }}</span>
                  </div>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.82rem; font-weight: 600; color: #334155;">{{ row.proveedor }}</span>
                    <span style="font-size: 0.72rem; color: #64748b;">Lote Fab: {{ row.loteProveedor }}</span>
                  </div>
                </td>
                <td>
                  <span style="font-size: 0.82rem; color: #475569;">{{ row.fechaRecepcion }}</span>
                </td>
                <td style="text-align: right; font-weight: 600; color: #64748b;">
                  {{ row.cantidadInicial }} {{ row.unidades }}
                </td>
                <td style="text-align: right; font-weight: 700; color: #7e22ce;">
                  {{ row.totalConsumido }} {{ row.unidades }}
                </td>
                <td style="text-align: right;">
                  <strong style="font-size: 0.95rem;" [style.color]="row.estadoStock === 'AGOTADO' ? '#94a3b8' : '#0891b2'">
                    {{ row.saldoDisponible }} {{ row.unidades }}
                  </strong>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-bar-wrap">
                      <div
                        class="progress-bar-fill"
                        [style.width.%]="row.porcentajeDisponible"
                        [class.progress-bar-fill--green]="row.porcentajeDisponible > 20"
                        [class.progress-bar-fill--amber]="row.porcentajeDisponible <= 20 && row.porcentajeDisponible > 0"
                        [class.progress-bar-fill--red]="row.porcentajeDisponible === 0"
                      ></div>
                    </div>
                    <span
                      class="progress-text font-bold"
                      [style.color]="row.porcentajeDisponible > 20 ? '#166534' : (row.porcentajeDisponible > 0 ? '#b45309' : '#dc2626')"
                    >
                      {{ row.porcentajeDisponible }}%
                    </span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <span
                    class="status-chip"
                    [class.status-chip--green]="row.estadoStock === 'DISPONIBLE'"
                    [class.status-chip--amber]="row.estadoStock === 'STOCK_BAJO'"
                    [class.status-chip--red]="row.estadoStock === 'AGOTADO'"
                  >
                    <span *ngIf="row.estadoStock === 'DISPONIBLE'">✓ Óptimo</span>
                    <span *ngIf="row.estadoStock === 'STOCK_BAJO'">⚠ Crítico (≤20%)</span>
                    <span *ngIf="row.estadoStock === 'AGOTADO'">✕ Agotado (0 Kg)</span>
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <!-- BOTÓN VER KARDEX / CONSUMOS -->
                    <button
                      type="button"
                      class="action-btn action-btn--view"
                      (click)="verKardexLote(row)"
                      title="Ver Kardex: ¿En qué se consumió este lote?"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <!-- BOTÓN EDITAR / AJUSTAR STOCK -->
                    <button
                      type="button"
                      class="action-btn action-btn--edit"
                      (click)="abrirEditarLote(row)"
                      title="Ajustar lote o corregir inventario"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="lotesFiltrados().length === 0">
                <td colspan="10" style="text-align: center; padding: 3rem; color: #64748b;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p style="margin: 0; font-size: 0.95rem;">No se encontraron lotes que coincidan con los filtros seleccionados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- 5. MODAL DETALLE / KARDEX ("¿EN QUÉ SE CONSUMIÓ ESTE LOTE?") -->
      <!-- ======================================================== -->
      <div class="modal-backdrop" *ngIf="selectedLoteKardex()" (click)="selectedLoteKardex.set(null)">
        <div class="modal-sheet modal-sheet--extra-wide" (click)="$event.stopPropagation()">
          <div class="modal-sheet-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge" style="background: #ecfeff; color: #0891b2;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0;">
                  Kardex & Historial de Consumos — {{ selectedLoteKardex()?.loteInterno }}
                </h3>
                <p style="font-size: 0.85rem; color: #64748b; margin: 2px 0 0 0;">
                  Trazabilidad de origen y deducción estricta por reactor
                </p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="selectedLoteKardex.set(null)">&times;</button>
          </div>

          <div class="modal-body" *ngIf="selectedLoteKardex() as lote">
            <!-- TARJETAS DE BALANCE DEL LOTE -->
            <div class="kardex-kpis-grid">
              <div class="kardex-kpi-box">
                <span class="kardex-kpi-label">CANTIDAD INICIAL INGRESADA</span>
                <span class="kardex-kpi-val">{{ lote.cantidadInicial }} {{ lote.unidades }}</span>
                <span class="kardex-kpi-sub">Recepción: {{ lote.fechaRecepcion }}</span>
              </div>

              <div class="kardex-kpi-box">
                <span class="kardex-kpi-label">TOTAL CONSUMIDO EN PLANTA</span>
                <span class="kardex-kpi-val text-purple">{{ lote.totalConsumido }} {{ lote.unidades }}</span>
                <span class="kardex-kpi-sub">{{ lote.totalMovimientos }} registros de pesada</span>
              </div>

              <div class="kardex-kpi-box">
                <span class="kardex-kpi-label">SALDO DISPONIBLE ACTUAL</span>
                <span class="kardex-kpi-val text-cyan">{{ lote.saldoDisponible }} {{ lote.unidades }}</span>
                <span class="kardex-kpi-sub">En almacén de materias primas</span>
              </div>

              <div class="kardex-kpi-box">
                <span class="kardex-kpi-label">% REMANENTE EN BODEGA</span>
                <span
                  class="kardex-kpi-val"
                  [style.color]="lote.porcentajeDisponible > 20 ? '#166534' : (lote.porcentajeDisponible > 0 ? '#b45309' : '#dc2626')"
                >
                  {{ lote.porcentajeDisponible }}%
                </span>
                <span class="kardex-kpi-sub">
                  {{ lote.estadoStock === 'DISPONIBLE' ? 'Stock Óptimo' : (lote.estadoStock === 'STOCK_BAJO' ? 'Próximo a agotarse' : 'Agotado 0 Kg') }}
                </span>
              </div>
            </div>

            <!-- FICHA TÉCNICA DEL INSUMO -->
            <div class="modal-fieldset" style="margin-top: 1rem;">
              <div class="modal-fieldset-header">
                <span class="modal-fieldset-title">Datos del Lote y Homologación Farmacopéica</span>
                <span class="modal-fieldset-badge">{{ lote.estadoCalidad }}</span>
              </div>
              <div class="modal-form-grid modal-form-grid--3">
                <div class="modal-field">
                  <label class="modal-field-label">Materia Prima</label>
                  <div class="field-val-box font-bold">{{ lote.producto }}</div>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Código Insumo</label>
                  <div class="field-val-box font-mono">{{ lote.codigoInsumo }}</div>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Proveedor Homologado</label>
                  <div class="field-val-box">{{ lote.proveedor }}</div>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Lote del Fabricante</label>
                  <div class="field-val-box font-mono">{{ lote.loteProveedor }}</div>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Fecha de Vencimiento</label>
                  <div class="field-val-box">{{ lote.fechaVencimiento }}</div>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Precio Unitario Base</label>
                  <div class="field-val-box">$ {{ lote.precioUnitario.toLocaleString('es-CO') }} / {{ lote.unidades }}</div>
                </div>
              </div>
            </div>

            <!-- TABLA DE MOVIMIENTOS: "¿EN QUÉ SE CONSUMIÓ ESTE LOTE?" -->
            <div class="modal-fieldset" style="margin-top: 1.25rem;">
              <div class="modal-fieldset-header">
                <span class="modal-fieldset-title">¿En qué se consumió este lote? (Movimientos en Planta)</span>
                <span class="modal-fieldset-badge" style="background: #f3e8ff; color: #7e22ce;">
                  {{ lote.movimientos.length }} Consumos Registrados
                </span>
              </div>

              <div class="table-responsive" *ngIf="lote.movimientos.length > 0">
                <table class="modal-table-editable">
                  <thead>
                    <tr>
                      <th style="min-width: 100px;">Fecha</th>
                      <th style="min-width: 130px;">Orden de Pedido</th>
                      <th style="min-width: 200px;">Producto Fabricado</th>
                      <th style="min-width: 160px;">Reactor / Marmita</th>
                      <th style="width: 130px; text-align: right;">Cantidad Pesada</th>
                      <th style="min-width: 140px;">Operador</th>
                      <th style="min-width: 180px;">Balanza Calibrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let m of lote.movimientos">
                      <td><span style="font-size: 0.8rem; font-weight: 600;">{{ m.fecha }}</span></td>
                      <td>
                        <span class="code-badge code-badge--cyan font-mono font-bold">{{ m.numeroPedido }}</span>
                      </td>
                      <td>
                        <div style="display: flex; flex-direction: column;">
                          <strong style="color: #0f172a; font-size: 0.825rem;">{{ m.productoNombre }}</strong>
                          <span style="font-size: 0.72rem; color: #64748b;">Lote PT: {{ m.loteAsignado }}</span>
                        </div>
                      </td>
                      <td>
                        <span style="font-size: 0.8rem; color: #334155;">{{ m.reactor }}</span>
                      </td>
                      <td style="text-align: right;">
                        <span class="font-bold text-purple" style="font-size: 0.9rem;">
                          -{{ m.cantidadConsumida }} {{ m.unidad }}
                        </span>
                      </td>
                      <td>
                        <span style="font-size: 0.8rem; color: #0f172a;">{{ m.operador }}</span>
                      </td>
                      <td>
                        <span style="font-size: 0.75rem; color: #64748b;">{{ m.balanza }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="lote.movimientos.length === 0" style="padding: 2.5rem; text-align: center; color: #64748b; background: #f8fafc; border-radius: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 6px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 14 14"></polyline>
                </svg>
                <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #1e293b;">Sin movimientos de consumo</p>
                <p style="margin: 4px 0 0 0; font-size: 0.8rem;">
                  Este lote ingresó con <strong>{{ lote.cantidadInicial }} {{ lote.unidades }}</strong> y aún no ha sido pesado en ningún reactor. El saldo se encuentra 100% disponible.
                </p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="selectedLoteKardex.set(null)">Cerrar Detalle</button>
            <a
              *ngIf="selectedLoteKardex()?.saldoDisponible! > 0"
              routerLink="/trazabilidad/estaciones/materia-prima/consumo/formato"
              class="btn btn-primary"
              (click)="selectedLoteKardex.set(null)"
            >
              Dosificar este Lote en Reactor &rarr;
            </a>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 6. MODAL EDICIÓN / AJUSTE DE LOTE                        -->
      <!-- ======================================================== -->
      <div class="modal-backdrop" *ngIf="editLoteItem()" (click)="editLoteItem.set(null)">
        <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
          <div class="modal-sheet-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge" style="background: #eff6ff; color: #2563eb;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0;">Ajustar Lote / Corregir Inventario</h3>
                <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">Lote: {{ editLoteItem()?.loteInterno }}</p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="editLoteItem.set(null)">&times;</button>
          </div>

          <div class="modal-body" *ngIf="editLoteItem() as item">
            <div class="modal-fieldset">
              <div class="modal-fieldset-header">
                <span class="modal-fieldset-title">Parámetros del Lote</span>
                <span class="modal-fieldset-badge">{{ item.codigoInsumo }}</span>
              </div>
              <div class="modal-form-grid modal-form-grid--3">
                <div class="modal-field">
                  <label class="modal-field-label">Lote Interno <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="item.loteInterno" class="modal-field-input font-mono font-bold" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Materia Prima <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="item.producto" class="modal-field-input font-bold" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Proveedor <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="item.proveedor" class="modal-field-input" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Lote Proveedor <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="item.loteProveedor" class="modal-field-input font-mono" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Cantidad Inicial Recibida (Kg/L) <span class="req">*</span></label>
                  <input type="number" [(ngModel)]="item.cantidadRecibida" class="modal-field-input font-bold" style="color: #0891b2;" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Unidad de Medida <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="item.unidades" class="modal-field-input" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Estado de Calidad</label>
                  <select [(ngModel)]="item.estadoCalidad" class="modal-field-select font-bold">
                    <option value="Aprobado">Aprobado</option>
                    <option value="Cuarentena">Cuarentena</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Fecha Recepción</label>
                  <input type="date" [(ngModel)]="item.fechaRecepcion" class="modal-field-input" />
                </div>
                <div class="modal-field">
                  <label class="modal-field-label">Fecha Vencimiento</label>
                  <input type="date" [(ngModel)]="item.fechaVencimiento" class="modal-field-input" />
                </div>
                <div class="modal-field full-width">
                  <label class="modal-field-label">Observaciones / Motivo de Ajuste</label>
                  <input type="text" [(ngModel)]="item.observaciones" placeholder="Indicar razón del ajuste de saldo..." class="modal-field-input" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="editLoteItem.set(null)">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="guardarEdicionLote()">Guardar Ajuste</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css'],
  styles: [`
    /* KPI GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.15rem 1.25rem;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.15s ease;
    }
    .kpi-card--warn {
      border-color: #fde68a;
      background: #fffdf5;
    }
    .kpi-icon-box {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon--cyan { background: #ecfeff; color: #0891b2; }
    .kpi-icon--blue { background: #eff6ff; color: #2563eb; }
    .kpi-icon--purple { background: #faf5ff; color: #9333ea; }
    .kpi-icon--amber { background: #fffbeb; color: #d97706; }
    .kpi-icon--red { background: #fef2f2; color: #dc2626; }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.04em;
    }
    .kpi-value {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 2px 0;
    }
    .kpi-unit {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
    }
    .kpi-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    /* FILTROS */
    .filter-controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem 0.85rem;
      flex: 1;
      min-width: 280px;
    }
    .search-input-field {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.85rem;
      color: #0f172a;
      width: 100%;
    }
    .status-pills-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .pill-filter-btn {
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      border: 1.5px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .pill-filter-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .pill-filter-btn--active {
      background: #0f172a !important;
      border-color: #0f172a !important;
      color: #ffffff !important;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .status-dot--green { background: #16a34a; }
    .status-dot--amber { background: #d97706; }
    .status-dot--red { background: #dc2626; }

    /* TABLA Y PROGRESS BAR */
    .table-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .table-header-legend {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 0.75rem;
      color: #64748b;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .legend-color {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }
    .legend-color--green { background: #16a34a; }
    .legend-color--amber { background: #d97706; }
    .legend-color--red { background: #dc2626; }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
    }
    .progress-bar-wrap {
      flex: 1;
      height: 8px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .progress-bar-fill--green { background: #16a34a; }
    .progress-bar-fill--amber { background: #d97706; }
    .progress-bar-fill--red { background: #dc2626; }
    .progress-text {
      font-size: 0.78rem;
      min-width: 38px;
      text-align: right;
    }

    .status-chip {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .status-chip--green {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .status-chip--amber {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #b45309;
    }
    .status-chip--red {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .row--exhausted {
      background: #fafafa;
      opacity: 0.75;
    }

    /* KARDEX MODAL */
    .kardex-kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 0.5rem;
    }
    .kardex-kpi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
    }
    .kardex-kpi-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.03em;
    }
    .kardex-kpi-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 2px 0;
    }
    .kardex-kpi-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }
    .field-val-box {
      padding: 0.6rem 0.8rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #0f172a;
    }

    .text-cyan { color: #0891b2; }
    .text-purple { color: #7e22ce; }
    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
  `]
})
export class MpInventarioComponent implements OnInit {
  data = inject(TraceabilityDataService);

  searchQuery = '';
  filtroEstado = signal<'TODOS' | 'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO'>('TODOS');
  feedbackMessage = signal<string | null>(null);

  // Modales
  selectedLoteKardex = signal<InventarioLoteMp | null>(null);
  editLoteItem = signal<IngresoMpRecord | null>(null);

  // Lotes filtrados reactivamente
  lotesFiltrados = computed(() => {
    const lotes = this.data.inventarioLotes();
    const query = this.searchQuery.toLowerCase().trim();
    const estado = this.filtroEstado();

    return lotes.filter(l => {
      const matchQuery =
        !query ||
        l.loteInterno.toLowerCase().includes(query) ||
        l.producto.toLowerCase().includes(query) ||
        l.proveedor.toLowerCase().includes(query) ||
        l.loteProveedor.toLowerCase().includes(query) ||
        (l.codigoInsumo && l.codigoInsumo.toLowerCase().includes(query));

      const matchEstado = estado === 'TODOS' || l.estadoStock === estado;

      return matchQuery && matchEstado;
    });
  });

  ngOnInit() {
    // Escucha cambios del inventario
  }

  verKardexLote(lote: InventarioLoteMp) {
    this.selectedLoteKardex.set(lote);
  }

  abrirEditarLote(lote: InventarioLoteMp) {
    // Buscar el ingreso correspondiente para editarlo
    const ing = this.data.ingresosMp().find(i => i.id === lote.id || i.loteInterno === lote.loteInterno);
    if (ing) {
      this.editLoteItem.set({ ...ing });
    }
  }

  guardarEdicionLote() {
    const item = this.editLoteItem();
    if (!item) return;

    this.data.updateIngresoMp(item);
    this.editLoteItem.set(null);
    this.feedbackMessage.set(`Lote ${item.loteInterno} actualizado correctamente.`);
    setTimeout(() => this.feedbackMessage.set(null), 3500);
  }

  exportarCsv() {
    const lotes = this.data.inventarioLotes();
    if (!lotes || lotes.length === 0) return;

    const headers = [
      'Lote Interno',
      'Materia Prima',
      'Código Insumo',
      'Proveedor',
      'Lote Proveedor',
      'Fecha Recepción',
      'Fecha Vencimiento',
      'Unidad',
      'Cantidad Inicial',
      'Total Consumido',
      'Saldo Disponible',
      'Porcentaje Restante',
      'Estado Stock',
      'Total Movimientos'
    ];

    const rows = lotes.map(l => [
      `"${l.loteInterno}"`,
      `"${l.producto}"`,
      `"${l.codigoInsumo}"`,
      `"${l.proveedor}"`,
      `"${l.loteProveedor}"`,
      `"${l.fechaRecepcion}"`,
      `"${l.fechaVencimiento}"`,
      `"${l.unidades}"`,
      l.cantidadInicial,
      l.totalConsumido,
      l.saldoDisponible,
      `"${l.porcentajeDisponible}%"`,
      `"${l.estadoStock}"`,
      l.totalMovimientos
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventario_Materias_Primas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.feedbackMessage.set('Reporte de inventario exportado exitosamente a CSV.');
    setTimeout(() => this.feedbackMessage.set(null), 3000);
  }
}
