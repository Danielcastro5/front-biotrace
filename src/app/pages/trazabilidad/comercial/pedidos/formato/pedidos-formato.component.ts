import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TraceabilityDataService, PedidoRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-pedidos-formato',
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
              <span class="station-domain-badge">Dermo-Pharma CRM</span>
              <span class="station-cat-badge">Módulo Comercial & Ventas</span>
            </div>
            <h1 class="station-title">Crear Orden de Pedido</h1>
            <p class="station-desc">Punto de inicio (Paso 1) de la cadena de trazabilidad de manufactura y asignación de lote.</p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/comercial/pedidos/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver órdenes de pedido</span>
          </a>
        </div>
      </header>

      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Orden de pedido creada exitosamente!</strong>
          <p>Se ha asignado el lote de producción y el pedido ya está disponible en la estación de consumo.</p>
        </div>
      </div>

      <form (ngSubmit)="guardarPedido()" class="form-flow">
        <div class="form-card-box">
          <div class="form-card-box__header">
            <div class="form-card-box__num">1</div>
            <div>
              <h3 class="form-card-box__title">Información de la Orden & Cliente</h3>
              <p class="form-card-box__subtitle">Asignación de cliente, producto a manufacturar y lote programado</p>
            </div>
          </div>

          <div class="form-inputs-grid form-inputs-grid--3">
            <div class="form-field-group">
              <label class="form-field-label">Número de Pedido Comercial <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="pedido.numeroPedido"
                name="numeroPedido"
                required
                class="form-field-control font-mono font-bold"
                style="color: #0891b2;"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Cliente Comercial Solicitante <span class="req-star">*</span></label>
              <select
                [(ngModel)]="pedido.clienteId"
                name="clienteId"
                (change)="onClienteChange()"
                required
                class="form-field-control font-bold"
              >
                <option value="">-- Seleccionar Cliente --</option>
                <option *ngFor="let c of data.clientes()" [value]="c.id">
                  {{ c.razonSocial }} ({{ c.ciudad }})
                </option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Producto Solicitado (con Fórmula) <span class="req-star">*</span></label>
              <select
                [(ngModel)]="pedido.productoId"
                name="productoId"
                (change)="onProductoChange()"
                required
                class="form-field-control font-bold"
              >
                <option value="">-- Seleccionar Producto con Fórmula --</option>
                <option *ngFor="let p of data.productos()" [value]="p.id">
                  {{ p.nombre }} ({{ p.codigo }})
                </option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Cantidad Solicitada (Unidades) <span class="req-star">*</span></label>
              <input
                type="number"
                [(ngModel)]="pedido.cantidadUnidades"
                name="cantidadUnidades"
                required
                placeholder="5000"
                class="form-field-control font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Lote de Fabricación Asignado <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="pedido.loteAsignado"
                name="loteAsignado"
                required
                class="form-field-control font-mono font-bold"
                style="color: #0891b2;"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Tamaño Estimado del Lote (Kg) <span class="req-star">*</span></label>
              <input
                type="number"
                step="0.1"
                [(ngModel)]="pedido.tamanoLoteKg"
                name="tamanoLoteKg"
                required
                placeholder="150"
                class="form-field-control font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Fecha de Pedido <span class="req-star">*</span></label>
              <input
                type="date"
                [(ngModel)]="pedido.fechaPedido"
                name="fechaPedido"
                required
                class="form-field-control"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Fecha Requerida de Entrega <span class="req-star">*</span></label>
              <input
                type="date"
                [(ngModel)]="pedido.fechaEntregaRequerida"
                name="fechaEntregaRequerida"
                required
                class="form-field-control"
              />
            </div>

            <div class="form-field-group full-width-span">
              <label class="form-field-label">Observaciones Comerciales & Despacho</label>
              <textarea
                [(ngModel)]="pedido.observaciones"
                name="observaciones"
                rows="3"
                placeholder="Instrucciones especiales de acondicionamiento o entrega..."
                class="form-field-control"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-action-bar">
          <a routerLink="/trazabilidad/comercial/pedidos/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Creando orden de pedido...' : 'Crear Orden de Pedido' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css'],
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
    .form-action-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
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
    .font-mono {
      font-family: monospace;
    }
    .font-bold {
      font-weight: 700;
    }
  `]
})
export class PedidosFormatoComponent implements OnInit {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);

  pedido: PedidoRecord = {
    id: '',
    numeroPedido: `PED-2026-${Math.floor(100 + Math.random() * 900)}`,
    clienteId: '',
    clienteNombre: '',
    productoId: '',
    productoNombre: '',
    loteAsignado: `LOT-BIO-2026-${Math.floor(100 + Math.random() * 900)}`,
    cantidadUnidades: 0,
    tamanoLoteKg: 0,
    fechaPedido: new Date().toISOString().split('T')[0],
    fechaEntregaRequerida: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    estado: 'En Proceso',
    observaciones: ''
  };

  ngOnInit() {
    const clients = this.data.clientes();
    const prods = this.data.productos();
    if (clients.length > 0) {
      this.pedido.clienteId = clients[0].id;
      this.pedido.clienteNombre = clients[0].razonSocial;
    }
    if (prods.length > 0) {
      this.pedido.productoId = prods[0].id;
      this.pedido.productoNombre = prods[0].nombre;
      this.pedido.tamanoLoteKg = prods[0].tamanoLoteEstandar;
    }
  }

  onClienteChange() {
    const c = this.data.clientes().find(cli => cli.id === this.pedido.clienteId);
    if (c) this.pedido.clienteNombre = c.razonSocial;
  }

  onProductoChange() {
    const p = this.data.productos().find(pr => pr.id === this.pedido.productoId);
    if (p) {
      this.pedido.productoNombre = p.nombre;
      this.pedido.tamanoLoteKg = p.tamanoLoteEstandar;
      this.pedido.loteAsignado = `LOT-${p.codigo.replace('PRD-', '')}-2026-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  guardarPedido() {
    this.isSaving.set(true);
    this.pedido.id = `PED-${Date.now().toString().slice(-4)}`;

    setTimeout(() => {
      this.data.addPedido({ ...this.pedido });
      this.isSaving.set(false);
      this.successMsg.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/comercial/pedidos/registros');
      }, 1400);
    }, 600);
  }
}
