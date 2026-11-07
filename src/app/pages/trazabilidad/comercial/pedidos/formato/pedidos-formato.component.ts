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
              <span class="station-cat-badge">Módulo Comercial & Ventas</span>
            </div>
            <h1 class="station-title">Crear Orden de Pedido</h1>
            <p class="station-desc">Punto de inicio (Paso 1) de la cadena de trazabilidad de manufactura.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/pedidos/registros" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Ver órdenes de pedido</span>
        </a>
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

      <form (ngSubmit)="guardarPedido()" class="filter-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0;">1. Información de la Orden & Cliente</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.15rem;">
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Número de Pedido *</label>
            <input type="text" [(ngModel)]="pedido.numeroPedido" name="numeroPedido" required class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px; font-family: monospace; font-weight: 700; color: #0891b2;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Cliente Comercial *</label>
            <select [(ngModel)]="pedido.clienteId" name="clienteId" (change)="onClienteChange()" required class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.65rem;">
              <option value="">-- Seleccionar Cliente --</option>
              <option *ngFor="let c of data.clientes()" [value]="c.id">{{ c.razonSocial }} ({{ c.ciudad }})</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Producto Solicitado *</label>
            <select [(ngModel)]="pedido.productoId" name="productoId" (change)="onProductoChange()" required class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.65rem;">
              <option value="">-- Seleccionar Producto con Fórmula --</option>
              <option *ngFor="let p of data.productos()" [value]="p.id">{{ p.nombre }} ({{ p.codigo }})</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Cantidad Solicitada (Unidades) *</label>
            <input type="number" [(ngModel)]="pedido.cantidadUnidades" name="cantidadUnidades" required placeholder="5000" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Lote de Fabricación Asignado *</label>
            <input type="text" [(ngModel)]="pedido.loteAsignado" name="loteAsignado" required class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px; font-family: monospace; font-weight: 800;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Tamaño Estimado del Lote (Kg) *</label>
            <input type="number" [(ngModel)]="pedido.tamanoLoteKg" name="tamanoLoteKg" required placeholder="150" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Fecha de Pedido *</label>
            <input type="date" [(ngModel)]="pedido.fechaPedido" name="fechaPedido" required class="filter-date" style="width: 100%; margin-top: 4px; padding: 0.65rem;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Fecha Requerida de Entrega *</label>
            <input type="date" [(ngModel)]="pedido.fechaEntregaRequerida" name="fechaEntregaRequerida" required class="filter-date" style="width: 100%; margin-top: 4px; padding: 0.65rem;" />
          </div>

          <div style="grid-column: 1 / -1;">
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Observaciones Comerciales</label>
            <textarea [(ngModel)]="pedido.observaciones" name="observaciones" rows="3" placeholder="Instrucciones especiales de acondicionamiento o entrega..." class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;"></textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
          <a routerLink="/trazabilidad/comercial/pedidos/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            {{ isSaving() ? 'Creando orden de pedido...' : 'Crear Orden de Pedido' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css'],
  styles: [`
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
    cantidadUnidades: 4000,
    tamanoLoteKg: 150,
    fechaPedido: new Date().toISOString().split('T')[0],
    fechaEntregaRequerida: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    estado: 'En Proceso',
    observaciones: 'Orden ingresada desde panel comercial. Requiere dosificación y pase a reactor.'
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
