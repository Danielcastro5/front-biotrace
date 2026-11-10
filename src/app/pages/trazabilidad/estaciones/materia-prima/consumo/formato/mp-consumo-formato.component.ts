import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TraceabilityDataService, PedidoRecord, ConsumoMpRecord, InventarioLoteMp } from '../../../../../../core/services/traceability-data.service';

interface ConsumoDetalleForm {
  materiaPrima: string;
  loteMp: string;
  programadoKg: number;
  realConsumidoKg: number;
  unidad: string;
  balanza: string;
}

@Component({
  selector: 'app-mp-consumo-formato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER -->
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
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Consumo Materia Prima — Llenar Formato</h1>
            <p class="station-desc">Dosificación y pesada en reactores con descuento automático del stock en bodega e inventario.</p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/estaciones/materia-prima/inventario" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Ver Inventario y Stock</span>
          </a>

          <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver registros de consumo</span>
          </a>
        </div>
      </header>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Consumo registrado exitosamente!</strong>
          <p>Las pesadas han sido validadas, el stock en bodega se ha descontado en tiempo real y el lote pasa a fabricación.</p>
        </div>
      </div>

      <!-- ALERTA DE ERROR DE STOCK -->
      <div *ngIf="hasStockError()" class="alert-box alert--error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Error de Disponibilidad de Inventario</strong>
          <p>Uno o más componentes superan el stock disponible en almacén o seleccionan un lote agotado (0 Kg). Corrige las cantidades o asigna otro lote con existencias para poder guardar.</p>
        </div>
      </div>

      <!-- FORMULARIO DE CONSUMO INTERCONECTADO -->
      <form (ngSubmit)="guardarConsumo()" class="form-flow">
        
        <!-- SECCIÓN 1: SELECCIONAR PEDIDO -->
        <div class="form-card-box">
          <div class="form-card-box__header">
            <div class="form-card-box__num">1</div>
            <div>
              <h3 class="form-card-box__title">Seleccionar Orden de Pedido Comercial</h3>
              <p class="form-card-box__subtitle">
                Al seleccionar el pedido, el sistema importa automáticamente el producto solicitado, su fórmula magistral y los lotes con stock en bodega.
              </p>
            </div>
          </div>

          <div class="form-inputs-grid form-inputs-grid--3">
            <div class="form-field-group">
              <label class="form-field-label">Orden de Pedido Comercial <span class="req-star">*</span></label>
              <select
                [(ngModel)]="selectedPedidoNumero"
                name="selectedPedidoNumero"
                (change)="onPedidoChange()"
                class="form-field-control font-bold"
                required
              >
                <option value="">-- Seleccionar Pedido Activo --</option>
                <option *ngFor="let ped of data.pedidos()" [value]="ped.numeroPedido">
                  {{ ped.numeroPedido }} • {{ ped.clienteNombre }} ({{ ped.productoNombre }})
                </option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Producto Asociado</label>
              <input
                type="text"
                [value]="selectedPedido() ? selectedPedido()?.productoNombre : (selectedPedidoNumero ? 'Producto Personalizado' : 'Selecciona una orden arriba')"
                disabled
                class="form-field-control form-field-control--readonly font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Lote Asignado a Fabricar</label>
              <input
                type="text"
                [value]="selectedPedido() ? selectedPedido()?.loteAsignado : manualLote"
                (input)="manualLote = $any($event.target).value"
                [disabled]="!!selectedPedido()"
                placeholder="LOT-BIO-2026-001"
                class="form-field-control font-mono font-bold"
                style="color: #0891b2;"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: PARÁMETROS DE DESTINO Y EQUIPO -->
        <div class="form-card-box">
          <div class="form-card-box__header">
            <div class="form-card-box__num">2</div>
            <div>
              <h3 class="form-card-box__title">Destino de Mezcla & Operador</h3>
              <p class="form-card-box__subtitle">Identificación del equipo de producción y pesada analítica</p>
            </div>
          </div>

          <div class="form-inputs-grid form-inputs-grid--3">
            <div class="form-field-group">
              <label class="form-field-label">Reactor / Marmita de Mezcla <span class="req-star">*</span></label>
              <select [(ngModel)]="formConsumo.reactor" name="reactor" class="form-field-control" required>
                <option value="Reactor R-101 (Inox 500L)">Reactor R-101 (Inox 500L)</option>
                <option value="Reactor R-102 (Inox 250L)">Reactor R-102 (Inox 250L)</option>
                <option value="Marmita Calefactora M-01 (100L)">Marmita Calefactora M-01 (100L)</option>
                <option value="Homogeneizador Turbo-200">Homogeneizador Turbo-200</option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Fecha de Pesada & Consumo <span class="req-star">*</span></label>
              <input type="date" [(ngModel)]="formConsumo.fecha" name="fecha" class="form-field-control" required />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Operador Responsable de Pesada <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formConsumo.operador" name="operador" placeholder="Carlos Mendoza" class="form-field-control font-bold" required />
            </div>

            <div class="form-field-group full-width-span">
              <label class="form-field-label">Observaciones de Pesada / Condiciones Ambientales</label>
              <input
                type="text"
                [(ngModel)]="formConsumo.observaciones"
                name="observaciones"
                placeholder="Pesada efectuada bajo campana de flujo laminar. Balanza calibrada con pesas patrón clase F1."
                class="form-field-control"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: TABLA DE DOSIFICACIÓN Y PESADA SEGÚN FÓRMULA -->
        <div class="form-card-box table-card-box">
          <div class="table-card-box__header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="form-card-box__num">3</span>
                <h3 class="form-card-box__title" style="margin: 0;">Dosificación de Materias Primas según Fórmula Magistral</h3>
              </div>
              <p class="form-card-box__subtitle" style="margin-top: 4px;">
                Selecciona los <strong>lotes con stock disponible</strong>. Los lotes agotados (0 Kg) quedan deshabilitados automáticamente.
              </p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="agregarInsumoExtra()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Agregar Insumo</span>
            </button>
          </div>

          <div class="table-responsive-box">
            <table class="consumption-table">
              <thead>
                <tr>
                  <th style="min-width: 220px;">Materia Prima / Componente</th>
                  <th style="min-width: 280px;">Lote MP a Descontar de Bodega *</th>
                  <th style="width: 130px; text-align: right;">Teórico (Kg)</th>
                  <th style="width: 170px; text-align: right;">Peso Real Consumido (Kg) *</th>
                  <th style="min-width: 180px;">Balanza Calibrada</th>
                  <th style="width: 120px; text-align: center;">Balance</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let det of componentes; let i = index" [class.tr--has-error]="isRowStockError(det)">
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="det.materiaPrima"
                      [name]="'mp_nom_' + i"
                      class="table-row-input font-bold"
                      placeholder="Nombre del insumo / principio activo"
                      required
                    />
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <select
                        [(ngModel)]="det.loteMp"
                        (ngModelChange)="onLoteSelected(det)"
                        [name]="'loteMp_' + i"
                        class="table-row-select font-mono"
                        [class.table-row-select--error]="isRowStockError(det)"
                        required
                      >
                        <option value="">-- Seleccionar Lote de Bodega --</option>
                        
                        <!-- Si el lote asignado en la receta no está en la lista normal, mostrarlo -->
                        <option *ngIf="det.loteMp && !isLotInInventario(det.loteMp)" [value]="det.loteMp">
                          {{ det.loteMp }} (Lote Pre-asignado)
                        </option>

                        <!-- LOTES CON STOCK DISPONIBLE (SELECCIONABLES) -->
                        <optgroup label="Lotes con Stock Disponible en Almacén">
                          <ng-container *ngFor="let lote of data.inventarioLotes()">
                            <option
                              *ngIf="lote.saldoDisponible > 0"
                              [value]="lote.loteInterno"
                            >
                              {{ lote.loteInterno }} — {{ lote.producto }} (Disp: {{ lote.saldoDisponible }} {{ lote.unidades }} | {{ lote.porcentajeDisponible }}%)
                            </option>
                          </ng-container>
                        </optgroup>

                        <!-- LOTES AGOTADOS (DESHABILITADOS - NO SELECCIONABLES) -->
                        <optgroup label="Lotes Agotados (0 Kg) - No Seleccionables">
                          <ng-container *ngFor="let lote of data.inventarioLotes()">
                            <option
                              *ngIf="lote.saldoDisponible <= 0"
                              [value]="lote.loteInterno"
                              [disabled]="true"
                              style="color: #94a3b8; background: #f8fafc;"
                            >
                              ⛔ {{ lote.loteInterno }} — {{ lote.producto }} (AGOTADO - 0 {{ lote.unidades }})
                            </option>
                          </ng-container>
                        </optgroup>
                      </select>

                      <!-- Pill de advertencia de stock reactiva -->
                      <div *ngIf="getStockWarning(det) as warn" class="stock-warn-pill" [class.stock-warn-pill--error]="isRowStockError(det)">
                        {{ warn }}
                      </div>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <input
                        type="number"
                        step="0.01"
                        [(ngModel)]="det.programadoKg"
                        [name]="'prog_' + i"
                        class="table-row-input table-row-input--num text-right"
                        style="width: 80px;"
                      />
                      <span class="unit-text">Kg</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <input
                        type="number"
                        step="0.01"
                        min="0.001"
                        [(ngModel)]="det.realConsumidoKg"
                        [name]="'real_' + i"
                        class="table-row-input table-row-input--num table-row-input--highlight text-right"
                        [class.table-row-input--error]="isRowStockError(det)"
                        style="width: 95px;"
                        required
                      />
                      <span class="unit-text font-bold" style="color: #0891b2;">Kg</span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="det.balanza"
                      [name]="'balanza_' + i"
                      class="table-row-input"
                      placeholder="Balanza Analítica Calibrada Mettler"
                    />
                  </td>
                  <td style="text-align: center;">
                    <span
                      class="status-chip"
                      [class.status-chip--exact]="det.realConsumidoKg === det.programadoKg"
                      [class.status-chip--diff]="det.realConsumidoKg !== det.programadoKg"
                    >
                      {{ det.realConsumidoKg === det.programadoKg ? '✓ Exacto' : '± Desv ' + ((det.realConsumidoKg - det.programadoKg) > 0 ? '+' : '') + (det.realConsumidoKg - det.programadoKg).toFixed(2) }}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      *ngIf="componentes.length > 1"
                      (click)="eliminarInsumo(i)"
                      class="btn-row-del"
                      title="Eliminar insumo"
                    >
                      &times;
                    </button>
                  </td>
                </tr>

                <tr *ngIf="componentes.length === 0">
                  <td colspan="7" style="text-align: center; padding: 2.5rem; color: #64748b;">
                    <p style="margin: 0 0 0.75rem 0; font-size: 0.95rem;">No hay componentes en la lista de pesaje.</p>
                    <button type="button" class="btn btn-secondary btn-sm" (click)="agregarInsumoExtra()">
                      + Agregar Primer Insumo
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RESUMEN DE BALANCE DE MASA -->
          <div class="mass-balance-bar" *ngIf="componentes.length > 0">
            <div class="mass-balance-item">
              <span class="mass-label">TOTAL TEÓRICO:</span>
              <span class="mass-val">{{ totalTeorico().toFixed(2) }} Kg</span>
            </div>
            <div class="mass-balance-item">
              <span class="mass-label">TOTAL PESADO REAL:</span>
              <span class="mass-val mass-val--cyan">{{ totalReal().toFixed(2) }} Kg</span>
            </div>
            <div class="mass-balance-item">
              <span class="mass-label">DESVIACIÓN DE MASA:</span>
              <span class="mass-val" [style.color]="(totalReal() - totalTeorico()) === 0 ? '#16a34a' : '#d97706'">
                {{ (totalReal() - totalTeorico()).toFixed(2) }} Kg ({{ totalTeorico() > 0 ? (((totalReal() - totalTeorico()) / totalTeorico()) * 100).toFixed(2) : '0.00' }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- BARRA FINAL DE ACCIONES -->
        <div class="form-action-bar">
          <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/registros" class="btn btn-secondary">
            Cancelar
          </a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="isSaving() || componentes.length === 0 || hasStockError()"
            [title]="hasStockError() ? 'Corrige los errores de stock para habilitar el guardado' : 'Guardar consumo y descontar inventario'"
          >
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Registrando en reactor...' : 'Guardar Consumo & Descontar Lotes' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../../../../../../shared/styles/registros-common.css'],
  styles: [`
    .form-flow {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-card-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
    }
    .form-card-box__header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1.25rem;
    }
    .form-card-box__num {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #ecfeff;
      border: 1.5px solid #0891b2;
      color: #0891b2;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .form-card-box__title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .form-card-box__subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .form-inputs-grid {
      display: grid;
      gap: 1.15rem;
    }
    .form-inputs-grid--3 {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }
    .full-width-span {
      grid-column: 1 / -1;
    }
    .form-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-field-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }
    .req-star {
      color: #dc2626;
    }
    .form-field-control {
      width: 100%;
      box-sizing: border-box;
      padding: 0.65rem 0.85rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.15s ease;
    }
    .form-field-control:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }
    .form-field-control--readonly {
      background: #f8fafc;
      color: #475569;
      border-color: #e2e8f0;
      cursor: not-allowed;
    }

    /* TABLA DE CONSUMO */
    .table-card-box {
      padding: 0;
      overflow: hidden;
    }
    .table-card-box__header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      background: #fcfdfe;
    }
    .table-responsive-box {
      width: 100%;
      overflow-x: auto;
    }
    .consumption-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .consumption-table th {
      background: #f8fafc;
      padding: 0.8rem 1rem;
      text-align: left;
      font-weight: 700;
      color: #475569;
      border-bottom: 1.5px solid #e2e8f0;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .consumption-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .tr--has-error {
      background: #fff5f5;
    }
    .table-row-input, .table-row-select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
    }
    .table-row-input:focus, .table-row-select:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15);
    }
    .table-row-input--error, .table-row-select--error {
      border-color: #dc2626 !important;
      background: #fff5f5 !important;
    }
    .table-row-input--num {
      font-family: monospace;
      font-size: 0.875rem;
    }
    .table-row-input--highlight {
      background: #ecfeff;
      border-color: #0891b2;
      font-weight: 800;
      color: #0891b2;
    }
    .stock-warn-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: #b45309;
      background: #fef3c7;
      border: 1px solid #fde68a;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
    .stock-warn-pill--error {
      color: #991b1b;
      background: #fee2e2;
      border-color: #fca5a5;
    }
    .unit-text {
      font-size: 0.78rem;
      color: #64748b;
    }
    .text-right {
      text-align: right;
    }
    .status-chip {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .status-chip--exact {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .status-chip--diff {
      background: #fffbeb;
      border: 1px solid #fef08a;
      color: #b45309;
    }
    .btn-row-del {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .btn-row-del:hover {
      background: #fee2e2;
    }
    .mass-balance-bar {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .mass-balance-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mass-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
    }
    .mass-val {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }
    .mass-val--cyan {
      color: #0891b2;
    }
    .form-action-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .alert-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .alert--success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .alert--error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .font-mono {
      font-family: monospace;
    }
    .font-bold {
      font-weight: 700;
    }
  `]
})
export class MpConsumoFormatoComponent implements OnInit {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);

  selectedPedidoNumero = '';
  manualLote = '';
  selectedPedido = signal<PedidoRecord | null>(null);

  formConsumo = {
    reactor: 'Reactor R-101 (Inox 500L)',
    fecha: new Date().toISOString().split('T')[0],
    operador: '',
    observaciones: ''
  };

  componentes: ConsumoDetalleForm[] = [];

  ngOnInit() {
    const peds = this.data.pedidos();
    if (peds.length > 0) {
      this.selectedPedidoNumero = peds[0].numeroPedido;
      this.onPedidoChange();
    } else {
      this.cargarComponentesPorDefecto();
    }
  }

  isLotInInventario(lote: string): boolean {
    return this.data.inventarioLotes().some(l => l.loteInterno === lote);
  }

  getSaldoDisponible(loteInterno: string): number {
    const l = this.data.inventarioLotes().find(item => item.loteInterno === loteInterno);
    return l ? l.saldoDisponible : 999999;
  }

  onLoteSelected(det: ConsumoDetalleForm) {
    const l = this.data.inventarioLotes().find(item => item.loteInterno === det.loteMp);
    if (l) {
      if (!det.materiaPrima || det.materiaPrima === 'Insumo') {
        det.materiaPrima = l.producto;
      }
      det.unidad = l.unidades;
    }
  }

  getStockWarning(det: ConsumoDetalleForm): string | null {
    if (!det.loteMp) return null;
    const l = this.data.inventarioLotes().find(item => item.loteInterno === det.loteMp);
    if (!l) return null;

    if (l.saldoDisponible <= 0) {
      return `⛔ LOTE AGOTADO: 0 ${l.unidades} disponibles en almacén (no seleccionable)`;
    }

    const real = Number(det.realConsumidoKg) || 0;
    if (real > l.saldoDisponible) {
      return `⚠ Excede saldo: disponible ${l.saldoDisponible} ${l.unidades} (Faltan ${(real - l.saldoDisponible).toFixed(2)})`;
    }

    if (l.porcentajeDisponible <= 20) {
      return `⚠ Stock crítico en bodega (${l.saldoDisponible} ${l.unidades} / ${l.porcentajeDisponible}% restante)`;
    }

    return null;
  }

  isRowStockError(det: ConsumoDetalleForm): boolean {
    if (!det.loteMp) return false;
    const l = this.data.inventarioLotes().find(item => item.loteInterno === det.loteMp);
    if (!l) return false;
    return l.saldoDisponible <= 0 || (Number(det.realConsumidoKg) || 0) > l.saldoDisponible;
  }

  hasStockError(): boolean {
    return this.componentes.some(det => this.isRowStockError(det));
  }

  onPedidoChange() {
    const ped = this.data.pedidos().find(p => p.numeroPedido === this.selectedPedidoNumero);
    this.selectedPedido.set(ped || null);

    if (ped) {
      const prod = this.data.productos().find(pr => pr.id === ped.productoId || pr.nombre === ped.productoNombre);
      if (prod && prod.formula && prod.formula.length > 0) {
        this.componentes = prod.formula.map(f => {
          // Si el lote sugerido existe y tiene stock, usarlo; si no, buscar otro lote disponible del mismo insumo
          let loteElegido = f.loteSugerido;
          const loteMatch = this.data.inventarioLotes().find(l => l.loteInterno === f.loteSugerido);
          if (!loteMatch || loteMatch.saldoDisponible <= 0) {
            const alternativo = this.data.inventarioLotes().find(l =>
              l.producto.toLowerCase().includes(f.nombreMateriaPrima.toLowerCase()) && l.saldoDisponible > 0
            );
            if (alternativo) {
              loteElegido = alternativo.loteInterno;
            }
          }

          return {
            materiaPrima: f.nombreMateriaPrima,
            loteMp: loteElegido,
            programadoKg: f.cantidadPorLote,
            realConsumidoKg: f.cantidadPorLote,
            unidad: f.unidad,
            balanza: 'Balanza Analítica Calibrada Mettler Toledo'
          };
        });
        return;
      }
    }
    
    if (this.componentes.length === 0) {
      this.cargarComponentesPorDefecto();
    }
  }

  cargarComponentesPorDefecto() {
    const disponibles = this.data.inventarioLotes().filter(l => l.saldoDisponible > 0);
    if (disponibles.length > 0) {
      this.componentes = disponibles.slice(0, 2).map(l => ({
        materiaPrima: l.producto,
        loteMp: l.loteInterno,
        programadoKg: Math.min(5, l.saldoDisponible),
        realConsumidoKg: Math.min(5, l.saldoDisponible),
        unidad: l.unidades,
        balanza: 'Balanza Analítica Calibrada Mettler Toledo'
      }));
    } else {
      this.componentes = [];
    }
  }

  agregarInsumoExtra() {
    const availableLote = this.data.inventarioLotes().find(l => l.saldoDisponible > 0);
    const loteMp = availableLote ? availableLote.loteInterno : '';
    const materiaPrima = availableLote ? availableLote.producto : '';
    this.componentes.push({
      materiaPrima,
      loteMp,
      programadoKg: 1.0,
      realConsumidoKg: 1.0,
      unidad: availableLote ? availableLote.unidades : 'Kg',
      balanza: 'Balanza Analítica Calibrada Mettler Toledo'
    });
  }

  eliminarInsumo(index: number) {
    this.componentes.splice(index, 1);
  }

  totalTeorico(): number {
    return this.componentes.reduce((acc, curr) => acc + (Number(curr.programadoKg) || 0), 0);
  }

  totalReal(): number {
    return this.componentes.reduce((acc, curr) => acc + (Number(curr.realConsumidoKg) || 0), 0);
  }

  guardarConsumo() {
    if (this.hasStockError()) return;

    const ped = this.selectedPedido();
    this.isSaving.set(true);

    const numeroPedido = ped ? ped.numeroPedido : (this.selectedPedidoNumero || 'PED-2026-PILOTO');
    const clienteNombre = ped ? ped.clienteNombre : 'Producción Interna / Piloto';
    const productoNombre = ped ? ped.productoNombre : 'Sérum Especial BioTrace';
    const loteAsignado = ped ? ped.loteAsignado : (this.manualLote || 'LOT-BIO-2026-001');

    const nuevoConsumo: ConsumoMpRecord = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      codigoConsumo: `CON-2026-${Math.floor(100 + Math.random() * 900)}`,
      numeroPedido,
      clienteNombre,
      productoNombre,
      loteAsignado,
      reactor: this.formConsumo.reactor,
      fechaConsumo: this.formConsumo.fecha,
      operador: this.formConsumo.operador,
      detalles: this.componentes.map(c => ({ ...c })),
      estado: this.totalReal() === this.totalTeorico() ? 'Conforme' : 'Con Desviación',
      observaciones: this.formConsumo.observaciones
    };

    setTimeout(() => {
      this.data.addConsumoMp(nuevoConsumo);
      this.isSaving.set(false);
      this.successMsg.set(true);

      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/estaciones/materia-prima/inventario');
      }, 1400);
    }, 700);
  }
}
