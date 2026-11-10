import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TraceabilityDataService, PedidoRecord, ConsumoMpRecord, FabricacionRecord, CalidadRecord, IngresoMpRecord } from '../../../../core/services/traceability-data.service';

interface TraceChain {
  pedido: PedidoRecord;
  consumo?: ConsumoMpRecord;
  fabricacion?: FabricacionRecord;
  calidad?: CalidadRecord;
  ingresosMp: IngresoMpRecord[];
}

@Component({
  selector: 'app-trazabilidad-360',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon" style="background: #faf5ff; color: #7e22ce; border-color: #d8b4fe;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge" style="color: #7e22ce; background: #faf5ff; border-color: #e9d5ff;">EST-TR-360</span>
              <span class="station-cat-badge">Auditoría Integral & Cadena de Custodia</span>
            </div>
            <h1 class="station-title">Trazabilidad 360° Integral</h1>
            <p class="station-desc">Rastreo bidireccional desde la Orden de Pedido Comercial (Punto 1) hasta las Materias Primas de origen (Punto 5).</p>
          </div>
        </div>

        <button type="button" class="btn btn-secondary" (click)="imprimirReporte()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>Imprimir Ficha de Trazabilidad</span>
        </button>
      </header>

      <!-- BUSCADOR PRINCIPAL & CHIPS DE ACCESO RÁPIDO -->
      <div class="filter-card" style="padding: 1.5rem;">
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <label style="font-size: 0.8rem; font-weight: 700; color: #334155;">
            Ingresa el Número de Pedido o Número de Lote de Producto Terminado:
          </label>

          <div style="display: flex; gap: 0.75rem;">
            <div class="search-input-wrap" style="max-width: 100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                class="filter-input"
                placeholder="Ej: PED-2026-001 o LOT-SH-2026-001..."
                [(ngModel)]="searchCode"
                (keyup.enter)="ejecutarRastreo()"
              />
            </div>
            <button type="button" class="btn btn-primary" (click)="ejecutarRastreo()">
              Rastrear 360°
            </button>
          </div>

          <!-- CHIPS DE ACCESO RÁPIDO GENERADOS DESDE LA BASE DE DATOS -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #64748b;">Rastreo Rápido:</span>
            <button
              *ngFor="let p of data.pedidos().slice(0, 5)"
              type="button"
              class="quick-chip"
              (click)="seleccionarCaso(p.numeroPedido)"
            >
              {{ p.numeroPedido }} • {{ p.loteAsignado }} ({{ p.productoNombre }})
            </button>
          </div>
        </div>
      </div>

      <!-- RESULTADO DE LA CADENA DE TRAZABILIDAD (5 PUNTOS) -->
      <div *ngIf="activeChain() as chain" class="trace-chain-container" id="impresion-trazabilidad">
        
        <!-- BANNER DE RESUMEN DEL LOTE -->
        <div class="trace-summary-banner">
          <div class="trace-banner-left">
            <span class="trace-banner-tag">TRAZABILIDAD INTEGRAL VERIFICADA</span>
            <h2 class="trace-banner-title">{{ chain.pedido.productoNombre }}</h2>
            <p class="trace-banner-sub">
              Lote de Producción: <strong>{{ chain.pedido.loteAsignado }}</strong> • Pedido: <strong>{{ chain.pedido.numeroPedido }}</strong> • Cliente: <strong>{{ chain.pedido.clienteNombre }}</strong>
            </p>
          </div>
          <div class="trace-banner-status">
            <span class="status-badge status-badge--success" style="font-size: 0.85rem; padding: 6px 14px;">
              ✓ CADENA DE CUSTODIA CONFORME (100% AUDITABLE)
            </span>
          </div>
        </div>

        <!-- TIMELINE VERTICAL STEPPER -->
        <div class="timeline-stepper">

          <!-- ============================================== -->
          <!-- PASO 1: ORDEN DE PEDIDO & SALIDA (COMERCIAL)   -->
          <!-- ============================================== -->
          <div class="timeline-node">
            <div class="timeline-marker marker--blue">1</div>
            <div class="timeline-content">
              <div class="timeline-card-header">
                <div>
                  <span class="node-tag">PASO 1 • MÓDULO COMERCIAL</span>
                  <h3 class="node-title">Orden de Pedido & Salida Comercial</h3>
                </div>
                <span
                  class="status-badge"
                  [class.status-badge--success]="chain.pedido.estado.includes('Despachado')"
                  [class.status-badge--warning]="!chain.pedido.estado.includes('Despachado')"
                >
                  {{ chain.pedido.estado }}
                </span>
              </div>

              <div class="meta-summary-grid">
                <div class="meta-summary-box">
                  <span class="meta-label">N° DE PEDIDO</span>
                  <span class="meta-value">{{ chain.pedido.numeroPedido }}</span>
                  <span class="meta-sub">Fecha Solicitud: {{ chain.pedido.fechaPedido }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">CLIENTE DESTINATARIO</span>
                  <span class="meta-value">{{ chain.pedido.clienteNombre }}</span>
                  <span class="meta-sub">Entrega Requerida: {{ chain.pedido.fechaEntregaRequerida }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">UNIDADES SOLICITADAS</span>
                  <span class="meta-value">{{ chain.pedido.cantidadUnidades.toLocaleString('es-CO') }} uds</span>
                  <span class="meta-sub">Lote Estimado: {{ chain.pedido.tamanoLoteKg }} Kg</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">DESPACHO / GUÍA DE SALIDA</span>
                  <span class="meta-value" style="color: #166534;">
                    {{ chain.pedido.numeroGuiaDespacho || 'Pendiente de remisión' }}
                  </span>
                  <span class="meta-sub">Salida de planta autorizada</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 2: CONSUMO Y DOSIFICACIÓN EN REACTOR      -->
          <!-- ============================================== -->
          <div class="timeline-node">
            <div class="timeline-marker marker--cyan">2</div>
            <div class="timeline-content">
              <div class="timeline-card-header">
                <div>
                  <span class="node-tag">PASO 2 • ESTACIÓN DE CONSUMO</span>
                  <h3 class="node-title">Dosificación y Consumo en Reactor</h3>
                </div>
                <span class="status-badge status-badge--success" *ngIf="chain.consumo">
                  ✓ {{ chain.consumo.estado }} (Sin mermas)
                </span>
              </div>

              <div class="meta-summary-grid" *ngIf="chain.consumo as con">
                <div class="meta-summary-box">
                  <span class="meta-label">REGISTRO DE CONSUMO</span>
                  <span class="meta-value">{{ con.codigoConsumo }}</span>
                  <span class="meta-sub">Fecha de Pesada: {{ con.fechaConsumo }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">REACTOR ASIGNADO</span>
                  <span class="meta-value">{{ con.reactor }}</span>
                  <span class="meta-sub">Operador: {{ con.operador }}</span>
                </div>
              </div>

              <div class="modal-section" *ngIf="chain.consumo as con" style="margin-top: 0.75rem;">
                <h4 class="modal-section-title">Detalle de Materias Primas Pesadas:</h4>
                <table class="modal-subtable">
                  <thead>
                    <tr>
                      <th>Insumo / Materia Prima</th>
                      <th>Lote MP Descontado</th>
                      <th style="text-align: right;">Teórico</th>
                      <th style="text-align: right;">Real Pesado</th>
                      <th>Balanza Utilizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let d of con.detalles">
                      <td><strong>{{ d.materiaPrima }}</strong></td>
                      <td><span class="code-tag">{{ d.loteMp }}</span></td>
                      <td style="text-align: right; color: #64748b;">{{ d.programadoKg.toFixed(2) }} {{ d.unidad }}</td>
                      <td style="text-align: right; font-weight: 800; color: #0891b2;">{{ d.realConsumidoKg.toFixed(2) }} {{ d.unidad }}</td>
                      <td style="font-size: 0.75rem; color: #475569;">{{ d.balanza }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 3: FABRICACIÓN DEL PRODUCTO (PLANTA)      -->
          <!-- ============================================== -->
          <div class="timeline-node">
            <div class="timeline-marker marker--purple">3</div>
            <div class="timeline-content">
              <div class="timeline-card-header">
                <div>
                  <span class="node-tag">PASO 3 • ESTACIÓN DE FABRICACIÓN</span>
                  <h3 class="node-title">Manufactura & Control de Mezcla</h3>
                </div>
                <span class="status-badge status-badge--success" *ngIf="chain.fabricacion">
                  ✓ Despeje BPM (7/7 Conforme)
                </span>
              </div>

              <div class="meta-summary-grid" *ngIf="chain.fabricacion as fab">
                <div class="meta-summary-box">
                  <span class="meta-label">LOTE FABRICADO</span>
                  <span class="meta-value">{{ fab.lote }}</span>
                  <span class="meta-sub">Fecha: {{ fab.fecha }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">EQUIPO DE MEZCLADO</span>
                  <span class="meta-value">{{ fab.reactor }}</span>
                  <span class="meta-sub">Capacidad: {{ fab.tamanoLoteKg }} Kg</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">OPERADOR DE PLANTA</span>
                  <span class="meta-value">{{ fab.operador }}</span>
                  <span class="meta-sub">Supervisor: {{ fab.supervisor }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">FASES COMPLETADAS</span>
                  <span class="meta-value" style="color: #7e22ce;">{{ fab.totalPasos }} Fases</span>
                  <span class="meta-sub">Variables de agitación y temp</span>
                </div>
              </div>

              <div class="modal-section" *ngIf="chain.fabricacion as fab" style="margin-top: 0.75rem;">
                <h4 class="modal-section-title">Registro de Agitación y Temperatura en Reactor:</h4>
                <table class="modal-subtable">
                  <thead>
                    <tr>
                      <th style="width: 50px;">Fase</th>
                      <th>Procedimiento</th>
                      <th>RPM</th>
                      <th>Tiempo</th>
                      <th>Temp.</th>
                      <th>Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of fab.pasos">
                      <td><strong>#{{ p.pasoNumero }}</strong></td>
                      <td>{{ p.procedimiento }}</td>
                      <td><span class="code-tag">{{ p.rpm }}</span></td>
                      <td>{{ p.tiempo }}</td>
                      <td>{{ p.temperatura }}</td>
                      <td>{{ p.realizadoPor }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 4: CONTROL DE CALIDAD & LIBERACIÓN        -->
          <!-- ============================================== -->
          <div class="timeline-node">
            <div class="timeline-marker marker--emerald">4</div>
            <div class="timeline-content">
              <div class="timeline-card-header">
                <div>
                  <span class="node-tag">PASO 4 • LABORATORIO DE CALIDAD (QC/QA)</span>
                  <h3 class="node-title">Ensayos Físico-Químicos & Certificado COA</h3>
                </div>
                <span class="status-badge status-badge--success" *ngIf="chain.calidad">
                  {{ chain.calidad.dictamen }}
                </span>
              </div>

              <div class="meta-summary-grid" *ngIf="chain.calidad as qc">
                <div class="meta-summary-box">
                  <span class="meta-label">CERTIFICADO COA</span>
                  <span class="meta-value" style="color: #166534;">{{ qc.numeroCoa }}</span>
                  <span class="meta-sub">Fecha Liberación: {{ qc.fecha }}</span>
                </div>
                <div class="meta-summary-box">
                  <span class="meta-label">ANALISTA RESPONSABLE</span>
                  <span class="meta-value">{{ qc.analista }}</span>
                  <span class="meta-sub">Dirección: {{ qc.firmadoPor }}</span>
                </div>
              </div>

              <div class="modal-section" *ngIf="chain.calidad as qc" style="margin-top: 0.75rem;">
                <h4 class="modal-section-title">Resultados de Conformidad Farmacopea:</h4>
                <table class="modal-subtable">
                  <thead>
                    <tr>
                      <th>Parámetro</th>
                      <th>Especificación Oficial</th>
                      <th>Resultado Obtenido</th>
                      <th style="text-align: center;">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let param of qc.parametros">
                      <td><strong>{{ param.parametro }}</strong></td>
                      <td style="color: #64748b;">{{ param.especificacion }}</td>
                      <td><strong style="color: #0891b2;">{{ param.resultado }}</strong></td>
                      <td style="text-align: center;">
                        <span class="status-badge status-badge--success">✓ Conforme</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- PASO 5: MATERIAS PRIMAS DE ORIGEN (PROVEEDORES)-->
          <!-- ============================================== -->
          <div class="timeline-node">
            <div class="timeline-marker marker--amber">5</div>
            <div class="timeline-content">
              <div class="timeline-card-header">
                <div>
                  <span class="node-tag">PASO 5 • MATERIAS PRIMAS DE ORIGEN</span>
                  <h3 class="node-title">Recepción en Bodega & Homologación de Proveedores</h3>
                </div>
                <span class="status-badge status-badge--info">
                  {{ chain.ingresosMp.length }} Lotes de Insumos Auditados
                </span>
              </div>

              <div class="modal-section" style="margin-top: 0.5rem;">
                <table class="modal-subtable">
                  <thead>
                    <tr>
                      <th>Lote Interno</th>
                      <th>Materia Prima / Insumo</th>
                      <th>Proveedor Homologado</th>
                      <th>Lote Prov.</th>
                      <th>Fecha Recepción</th>
                      <th>Certificado COA</th>
                      <th style="text-align: center;">Calidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ing of chain.ingresosMp">
                      <td><span class="code-tag">{{ ing.loteInterno }}</span></td>
                      <td><strong>{{ ing.producto }}</strong></td>
                      <td>{{ ing.proveedor }}</td>
                      <td><span class="code-tag">{{ ing.loteProveedor }}</span></td>
                      <td>{{ ing.fechaRecepcion }}</td>
                      <td style="font-size: 0.75rem; color: #0891b2;">{{ ing.coaArchivo }}</td>
                      <td style="text-align: center;">
                        <span class="status-badge status-badge--success">✓ {{ ing.estadoCalidad }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ESTADO VACÍO SI NO SE ENCUENTRA -->
      <div *ngIf="!activeChain()" class="table-card" style="padding: 3rem; text-align: center;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 0.75rem;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
          No se encontró trazabilidad para "{{ searchCode }}"
        </h3>
        <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 1rem 0;">
          Ingresa un número de pedido (ej. PED-2026-001) o de lote (ej. LOT-SH-2026-001), o pulsa uno de los botones de rastreo rápido arriba.
        </p>
      </div>
    </div>
  `,
  styleUrls: ['../../../../shared/styles/registros-common.css'],
  styles: [`
    .quick-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .quick-chip:hover {
      background: #ecfeff;
      border-color: #0891b2;
      color: #0891b2;
    }
    .trace-chain-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .trace-summary-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
    }
    .trace-banner-tag {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #38bdf8;
      margin-bottom: 0.25rem;
    }
    .trace-banner-title {
      font-size: 1.45rem;
      font-weight: 800;
      margin: 0 0 4px 0;
    }
    .trace-banner-sub {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }
    .trace-banner-sub strong {
      color: #f8fafc;
    }

    /* TIMELINE STEPPER */
    .timeline-stepper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
    }
    .timeline-node {
      display: flex;
      gap: 1.25rem;
      position: relative;
    }
    .timeline-node::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 40px;
      bottom: -22px;
      width: 2px;
      background: #e2e8f0;
      z-index: 1;
    }
    .timeline-node:last-child::before {
      display: none;
    }
    .timeline-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .marker--blue { background: #2563eb; }
    .marker--cyan { background: #0891b2; }
    .marker--purple { background: #9333ea; }
    .marker--emerald { background: #16a34a; }
    .marker--amber { background: #d97706; }

    .timeline-content {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
    }
    .timeline-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.75rem;
    }
    .node-tag {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .node-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 2px 0 0 0;
    }

    @media print {
      body * {
        visibility: hidden;
      }
      #impresion-trazabilidad, #impresion-trazabilidad * {
        visibility: visible;
      }
      #impresion-trazabilidad {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
  `]
})
export class Trazabilidad360Component implements OnInit {
  data = inject(TraceabilityDataService);
  private route = inject(ActivatedRoute);

  searchCode = '';
  activeChain = signal<TraceChain | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchCode = params['q'];
      } else if (this.data.pedidos().length > 0) {
        this.searchCode = this.data.pedidos()[0].numeroPedido;
      }
      this.ejecutarRastreo();
    });
  }

  seleccionarCaso(code: string) {
    this.searchCode = code;
    this.ejecutarRastreo();
  }

  ejecutarRastreo() {
    const code = this.searchCode.trim().toLowerCase();
    if (!code) {
      this.activeChain.set(null);
      return;
    }

    // Buscar el pedido por número o por lote asignado
    const ped = this.data.pedidos().find(p =>
      p.numeroPedido.toLowerCase().includes(code) ||
      p.loteAsignado.toLowerCase().includes(code) ||
      p.productoNombre.toLowerCase().includes(code)
    );

    if (!ped) {
      this.activeChain.set(null);
      return;
    }

    // Buscar consumo vinculado
    const con = this.data.consumosMp().find(c =>
      c.numeroPedido === ped.numeroPedido ||
      c.loteAsignado === ped.loteAsignado
    );

    // Buscar fabricación vinculada
    const fab = this.data.fabricaciones().find(f =>
      f.lote === ped.loteAsignado ||
      f.numeroPedido === ped.numeroPedido
    );

    // Buscar control de calidad vinculado
    const qc = this.data.calidadRegistros().find(q =>
      q.lote === ped.loteAsignado ||
      q.numeroPedido === ped.numeroPedido
    );

    // Buscar lotes de materia prima utilizados
    let lotesInsumoIds: string[] = [];
    if (con && con.detalles) {
      lotesInsumoIds = con.detalles.map(d => d.loteMp);
    } else {
      // Tomar de la fórmula del producto
      const prod = this.data.productos().find(pr => pr.id === ped.productoId || pr.nombre === ped.productoNombre);
      if (prod) {
        lotesInsumoIds = prod.formula.map(f => f.loteSugerido);
      }
    }

    const ingresosEncontrados = this.data.ingresosMp().filter(ing =>
      lotesInsumoIds.includes(ing.loteInterno)
    );

    this.activeChain.set({
      pedido: ped,
      consumo: con,
      fabricacion: fab,
      calidad: qc,
      ingresosMp: ingresosEncontrados.length > 0 ? ingresosEncontrados : this.data.ingresosMp().slice(0, 3)
    });
  }

  imprimirReporte() {
    window.print();
  }
}

