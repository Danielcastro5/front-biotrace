import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TraceabilityDataService, PedidoRecord, ConsumoMpRecord } from '../../../../../../core/services/traceability-data.service';

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
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Consumo Materia Prima — Llenar Formato</h1>
            <p class="station-desc">Dosificación y pesada en reactores vinculada a órdenes de pedido y fórmulas galénicas.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/registros" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Ver registros de consumo</span>
        </a>
      </header>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Consumo registrado exitosamente!</strong>
          <p>La pesada ha sido validada y el lote de producción queda listo para la estación de fabricación.</p>
        </div>
      </div>

      <!-- FORMULARIO DE CONSUMO INTERCONECTADO -->
      <form (ngSubmit)="guardarConsumo()" class="form-flow">
        
        <!-- SECCIÓN 1: SELECCIONAR PEDIDO -->
        <div class="filter-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
            1. Seleccionar Orden de Pedido Comercial
          </h3>
          <p style="font-size: 0.825rem; color: #64748b; margin: 0 0 1rem 0;">
            Al seleccionar el pedido, el sistema importa automáticamente el producto solicitado, su fórmula magistral y los lotes disponibles en bodega.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Orden de Pedido *</label>
              <select
                [(ngModel)]="selectedPedidoNumero"
                name="selectedPedidoNumero"
                (change)="onPedidoChange()"
                class="filter-select"
                style="width: 100%; margin-top: 4px; padding: 0.65rem;"
                required
              >
                <option value="">-- Seleccionar Pedido Activo --</option>
                <option *ngFor="let ped of data.pedidos()" [value]="ped.numeroPedido">
                  {{ ped.numeroPedido }} • {{ ped.clienteNombre }} ({{ ped.productoNombre }})
                </option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Producto Seleccionado</label>
              <input
                type="text"
                [value]="selectedPedido() ? selectedPedido()?.productoNombre : 'Seleccione un pedido'"
                disabled
                class="filter-input"
                style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 0.65rem; border-radius: 8px; margin-top: 4px; font-weight: 700;"
              />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Lote Asignado a Fabricar</label>
              <input
                type="text"
                [value]="selectedPedido() ? selectedPedido()?.loteAsignado : 'No asignado'"
                disabled
                class="filter-input"
                style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 0.65rem; border-radius: 8px; margin-top: 4px; font-family: monospace; font-weight: 700; color: #0891b2;"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: PARÁMETROS DE DESTINO Y EQUIPO -->
        <div class="filter-card" style="padding: 1.5rem;" *ngIf="selectedPedido()">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
            2. Destino de Mezcla & Operador
          </h3>
          <p style="font-size: 0.825rem; color: #64748b; margin: 0 0 1rem 0;">
            Identificación del equipo de producción y pesada analítica
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Reactor de Mezcla *</label>
              <select [(ngModel)]="formConsumo.reactor" name="reactor" class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.65rem;">
                <option value="Reactor R-101 (Inox 500L)">Reactor R-101 (Inox 500L)</option>
                <option value="Reactor R-102 (Inox 250L)">Reactor R-102 (Inox 250L)</option>
                <option value="Marmita Calefactora M-01 (100L)">Marmita Calefactora M-01 (100L)</option>
                <option value="Homogeneizador Turbo-200">Homogeneizador Turbo-200</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Fecha de Pesada & Consumo *</label>
              <input type="date" [(ngModel)]="formConsumo.fecha" name="fecha" class="filter-date" style="width: 100%; margin-top: 4px; padding: 0.65rem;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Operador Responsable *</label>
              <input type="text" [(ngModel)]="formConsumo.operador" name="operador" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: TABLA DE DOSIFICACIÓN Y PESADA SEGÚN FÓRMULA -->
        <div class="table-card" *ngIf="selectedPedido()">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #fcfdfe;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">
              3. Dosificación de Materias Primas según Fórmula Magistral
            </h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0;">
              Ingresa el <strong>peso real consumido</strong> medido en balanza para cada insumo.
            </p>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Materia Prima / Componente</th>
                  <th>Lote MP a Descontar</th>
                  <th style="width: 140px; text-align: right;">Teórico (Kg)</th>
                  <th style="width: 180px; text-align: right;">Peso Real Consumido (Kg) *</th>
                  <th>Balanza Calibrada</th>
                  <th style="width: 110px; text-align: center;">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let det of componentes; let i = index">
                  <td>
                    <strong style="color: #0f172a;">{{ det.materiaPrima }}</strong>
                  </td>
                  <td>
                    <select [(ngModel)]="det.loteMp" [name]="'loteMp_' + i" class="filter-select" style="font-family: monospace; font-size: 0.78rem;">
                      <option *ngFor="let ing of data.ingresosMp()" [value]="ing.loteInterno">
                        {{ ing.loteInterno }} ({{ ing.producto.slice(0, 20) }}...)
                      </option>
                    </select>
                  </td>
                  <td style="text-align: right; font-weight: 700; color: #64748b;">
                    {{ det.programadoKg.toFixed(2) }} Kg
                  </td>
                  <td style="text-align: right;">
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="det.realConsumidoKg"
                      [name]="'real_' + i"
                      class="filter-input"
                      style="border: 1.5px solid #0891b2; font-weight: 800; text-align: right; background: #ecfeff; padding: 0.45rem 0.65rem; border-radius: 6px; width: 110px;"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="det.balanza"
                      [name]="'balanza_' + i"
                      class="filter-input"
                      style="border: 1px solid #cbd5e1; font-size: 0.75rem; padding: 0.4rem;"
                    />
                  </td>
                  <td style="text-align: center;">
                    <span
                      class="status-badge"
                      [class.status-badge--success]="det.realConsumidoKg === det.programadoKg"
                      [class.status-badge--warning]="det.realConsumidoKg !== det.programadoKg"
                    >
                      {{ det.realConsumidoKg === det.programadoKg ? '✓ Exacto' : '± Desv' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- BARRA FINAL DE GUARDADO -->
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;" *ngIf="selectedPedido()">
          <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/registros" class="btn btn-secondary">
            Cancelar
          </a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
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
    .form-flow {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
  `]
})
export class MpConsumoFormatoComponent implements OnInit {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);

  selectedPedidoNumero = '';
  selectedPedido = signal<PedidoRecord | null>(null);

  formConsumo = {
    reactor: 'Reactor R-101 (Inox 500L)',
    fecha: new Date().toISOString().split('T')[0],
    operador: 'Carlos Mendoza',
    observaciones: 'Pesada analítica verificada y conforme con la orden de pedido.'
  };

  componentes: ConsumoDetalleForm[] = [];

  ngOnInit() {
    // Si hay un pedido activo por defecto, seleccionarlo
    const peds = this.data.pedidos();
    if (peds.length > 0) {
      this.selectedPedidoNumero = peds[0].numeroPedido;
      this.onPedidoChange();
    }
  }

  onPedidoChange() {
    const ped = this.data.pedidos().find(p => p.numeroPedido === this.selectedPedidoNumero);
    this.selectedPedido.set(ped || null);

    if (ped) {
      // Buscar producto y su fórmula
      const prod = this.data.productos().find(pr => pr.id === ped.productoId || pr.nombre === ped.productoNombre);
      if (prod && prod.formula) {
        this.componentes = prod.formula.map(f => ({
          materiaPrima: f.nombreMateriaPrima,
          loteMp: f.loteSugerido,
          programadoKg: f.cantidadPorLote,
          realConsumidoKg: f.cantidadPorLote, // precarga el peso teórico
          unidad: f.unidad,
          balanza: 'Balanza Analítica Calibrada Mettler'
        }));
      }
    } else {
      this.componentes = [];
    }
  }

  guardarConsumo() {
    const ped = this.selectedPedido();
    if (!ped) return;

    this.isSaving.set(true);

    const nuevoConsumo: ConsumoMpRecord = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      codigoConsumo: `CON-2026-${Math.floor(100 + Math.random() * 900)}`,
      numeroPedido: ped.numeroPedido,
      clienteNombre: ped.clienteNombre,
      productoNombre: ped.productoNombre,
      loteAsignado: ped.loteAsignado,
      reactor: this.formConsumo.reactor,
      fechaConsumo: this.formConsumo.fecha,
      operador: this.formConsumo.operador,
      detalles: this.componentes.map(c => ({ ...c })),
      estado: 'Conforme',
      observaciones: this.formConsumo.observaciones
    };

    setTimeout(() => {
      this.data.addConsumoMp(nuevoConsumo);
      this.isSaving.set(false);
      this.successMsg.set(true);

      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/estaciones/materia-prima/consumo/registros');
      }, 1400);
    }, 700);
  }
}
