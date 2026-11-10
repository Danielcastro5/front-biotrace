import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TraceabilityDataService, PedidoRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-pedidos-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-PED-01</span>
              <span class="station-cat-badge">Módulo Comercial & Ventas</span>
            </div>
            <h1 class="station-title">Órdenes de Pedido — Registros & Salida</h1>
            <p class="station-desc">Punto inicial de la trazabilidad (Paso 1) y control de despacho/salida comercial.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/pedidos/formato" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Crear orden de pedido</span>
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
              placeholder="Buscar por número de pedido, cliente, producto o lote..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroEstado">
              <option value="TODOS">Todos los estados</option>
              <option value="Despachado (Salida Autorizada)">Despachado (Salida)</option>
              <option value="Listo para Despacho">Listo para Despacho</option>
              <option value="En Proceso">En Proceso</option>
            </select>

            <button
              *ngIf="searchTerm || filtroEstado !== 'TODOS'"
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
                <th>N° Pedido</th>
                <th>Cliente Comercial</th>
                <th>Producto Solicitado</th>
                <th>Unidades</th>
                <th>Lote Asignado</th>
                <th>Fecha Pedido</th>
                <th>Fecha Entrega</th>
                <th>Estado de Salida</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag" style="background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">
                    {{ reg.numeroPedido }}
                  </span>
                </td>
                <td>
                  <strong style="color: #0f172a;">{{ reg.clienteNombre }}</strong>
                </td>
                <td>{{ reg.productoNombre }}</td>
                <td><strong>{{ reg.cantidadUnidades.toLocaleString('es-CO') }} uds</strong></td>
                <td><span class="code-tag">{{ reg.loteAsignado }}</span></td>
                <td>{{ reg.fechaPedido }}</td>
                <td>{{ reg.fechaEntregaRequerida }}</td>
                <td>
                  <span
                    class="status-badge"
                    [class.status-badge--success]="reg.estado.includes('Despachado')"
                    [class.status-badge--warning]="reg.estado.includes('Listo')"
                    [class.status-badge--info]="reg.estado.includes('En Proceso')"
                  >
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <!-- BOTÓN ESPECIAL: DAR SALIDA / DESPACHO -->
                    <button
                      *ngIf="reg.estado !== 'Despachado (Salida Autorizada)'"
                      type="button"
                      class="action-btn--dispatch"
                      (click)="darSalida(reg)"
                      title="Autorizar salida y generar despacho"
                    >
                      <span>✓ Dar Salida</span>
                    </button>

                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver detalle de pedido">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--edit" (click)="editarRegistro(reg)" title="Editar pedido">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--delete" (click)="confirmarEliminar(reg)" title="Eliminar pedido">
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

    <!-- MODAL DETALLE DE PEDIDO & SALIDA -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              </svg>
            </div>
            <div>
              <h3>Orden de Pedido — {{ selectedItem()?.numeroPedido }}</h3>
              <p>Lote Asociado: <strong>{{ selectedItem()?.loteAsignado }}</strong> • {{ selectedItem()?.clienteNombre }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">PRODUCTO SOLICITADO</span>
              <span class="meta-value">{{ item.productoNombre }}</span>
              <span class="meta-sub">Cantidad: {{ item.cantidadUnidades.toLocaleString('es-CO') }} unidades</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">LOTE ASIGNADO</span>
              <span class="meta-value" style="color: #0891b2;">{{ item.loteAsignado }}</span>
              <span class="meta-sub">Lote de formulación: {{ item.tamanoLoteKg }} Kg</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">FECHAS DE GESTIÓN</span>
              <span class="meta-value">Solicitud: {{ item.fechaPedido }}</span>
              <span class="meta-sub">Requerida: {{ item.fechaEntregaRequerida }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ESTADO DE SALIDA</span>
              <span class="meta-value" [style.color]="item.estado.includes('Despachado') ? '#16a34a' : '#d97706'">{{ item.estado }}</span>
              <span class="meta-sub">{{ item.numeroGuiaDespacho || 'Pendiente de despacho' }}</span>
            </div>
          </div>

          <div class="modal-section" *ngIf="item.numeroGuiaDespacho">
            <h4 class="modal-section-title">Comprobante de Salida & Remisión</h4>
            <div class="modal-obs-card" style="border-left-color: #10b981; background: #f0fdf4;">
              <p style="margin: 0; font-size: 0.85rem; color: #166534;">
                <strong>Guía de Remisión Oficial:</strong> {{ item.numeroGuiaDespacho }} — Salida autorizada de planta con certificado de análisis adjunto.
              </p>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Observaciones</h4>
            <div class="modal-obs-card">
              {{ item.observaciones }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
          <button type="button" class="btn btn-primary" (click)="irATrazabilidad(selectedItem()!)">
            Ver Trazabilidad 360° &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR PEDIDO -->
    <div class="modal-backdrop" *ngIf="editItem()" (click)="editItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge" style="background: #eff6ff; color: #2563eb;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <div>
              <h3>Editar Orden de Pedido & Despacho</h3>
              <p>Formato completo de solicitud comercial — {{ editItem()?.numeroPedido }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <!-- SECCIÓN 1: IDENTIFICACIÓN Y VÍNCULO COMERCIAL -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">1. Vínculo de Cliente y Producto</span>
              <span class="modal-fieldset-badge">{{ item.estado }}</span>
            </div>
            <div class="modal-form-grid modal-form-grid--4">
              <div class="modal-field">
                <label class="modal-field-label">Número de Pedido <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.numeroPedido" class="modal-field-input" placeholder="PED-..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Cliente Solicitante <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.clienteNombre" class="modal-field-input" placeholder="Razón social cliente" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Producto Solicitado <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.productoNombre" class="modal-field-input" placeholder="Nombre de producto" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Lote Industrial Asignado <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.loteAsignado" class="modal-field-input" placeholder="LOT-..." />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: CANTIDADES Y CRONOGRAMA -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">2. Cantidad, Volumen y Cronograma</span>
              <span class="modal-fieldset-badge">Fabricación</span>
            </div>
            <div class="modal-form-grid modal-form-grid--4">
              <div class="modal-field">
                <label class="modal-field-label">Cantidad (Unidades) <span class="req">*</span></label>
                <input type="number" [(ngModel)]="item.cantidadUnidades" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Tamaño Lote (Kg) <span class="req">*</span></label>
                <input type="number" [(ngModel)]="item.tamanoLoteKg" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Fecha de Radicación <span class="req">*</span></label>
                <input type="date" [(ngModel)]="item.fechaPedido" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Fecha Entrega Requerida <span class="req">*</span></label>
                <input type="date" [(ngModel)]="item.fechaEntregaRequerida" class="modal-field-input" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: LOGÍSTICA DE SALIDA Y ESTADO -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">3. Estado de Orden y Remisión de Despacho</span>
              <span class="modal-fieldset-badge">Salida</span>
            </div>
            <div class="modal-form-grid">
              <div class="modal-field">
                <label class="modal-field-label">Estado Actual de la Orden <span class="req">*</span></label>
                <select [(ngModel)]="item.estado" class="modal-field-select">
                  <option value="En Proceso">En Proceso</option>
                  <option value="Listo para Despacho">Listo para Despacho</option>
                  <option value="Despachado (Salida Autorizada)">Despachado (Salida Autorizada)</option>
                </select>
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Número de Guía / Remisión de Despacho</label>
                <input type="text" [(ngModel)]="item.numeroGuiaDespacho" class="modal-field-input" placeholder="GUIA-..." />
              </div>
              <div class="modal-field modal-form-grid--full">
                <label class="modal-field-label">Observaciones Comerciales y de Entrega</label>
                <textarea [(ngModel)]="item.observaciones" rows="3" class="modal-field-textarea" placeholder="Instrucciones especiales de transporte, embalaje o entrega al cliente..."></textarea>
              </div>
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
        <h4>¿Eliminar orden de pedido?</h4>
        <p>Está a punto de eliminar la orden <strong>{{ itemToDelete()?.numeroPedido }}</strong> ({{ itemToDelete()?.clienteNombre }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class PedidosRegistrosComponent {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  searchTerm = '';
  filtroEstado = 'TODOS';

  selectedItem = signal<PedidoRecord | null>(null);
  editItem = signal<PedidoRecord | null>(null);
  itemToDelete = signal<PedidoRecord | null>(null);

  filteredRecords(): PedidoRecord[] {
    const list = this.data.pedidos();
    const term = this.searchTerm.toLowerCase().trim();
    const estado = this.filtroEstado;

    return list.filter(r => {
      const matchText = !term ||
        r.numeroPedido.toLowerCase().includes(term) ||
        r.clienteNombre.toLowerCase().includes(term) ||
        r.productoNombre.toLowerCase().includes(term) ||
        r.loteAsignado.toLowerCase().includes(term);

      const matchEstado = estado === 'TODOS' || r.estado === estado;

      return matchText && matchEstado;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroEstado = 'TODOS';
  }

  darSalida(item: PedidoRecord) {
    const guia = `GUIA-SALIDA-${Math.floor(1000 + Math.random() * 9000)}`;
    this.data.despacharPedido(item.id, guia);
  }

  verDetalle(item: PedidoRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: PedidoRecord) {
    this.editItem.set({ ...item });
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updatePedido(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: PedidoRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deletePedido(it.id);
      this.itemToDelete.set(null);
    }
  }

  irATrazabilidad(item: PedidoRecord) {
    this.selectedItem.set(null);
    this.router.navigate(['/trazabilidad/estaciones/trazabilidad-360'], {
      queryParams: { q: item.numeroPedido }
    });
  }
}
