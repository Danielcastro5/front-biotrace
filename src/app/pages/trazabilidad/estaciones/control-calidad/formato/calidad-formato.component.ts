import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { TraceabilityDataService, CalidadRecord } from '../../../../../core/services/traceability-data.service';

interface ParametroCalidad {
  parametro: string;
  especificacion: string;
  resultado: string;
  cumple: boolean;
}

@Component({
  selector: 'app-calidad-formato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon station-badge-icon--cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-QC-01</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Control de Calidad & Laboratorio QC/QA</span>
            </div>
            <h1 class="station-title">Control de Calidad — Llenar Formato</h1>
            <p class="station-desc">
              Ensayos físico-químicos de producto a granel o terminado y emisión de dictamen de liberación COA.
            </p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/estaciones/control-calidad/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver historial de análisis</span>
          </a>
        </div>
      </header>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMessage()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Análisis de calidad registrado y certificado generado!</strong>
          <p>El dictamen ha sido emitido y archivado en los registros BPM de la planta.</p>
        </div>
      </div>

      <!-- FORMULARIO DE CALIDAD -->
      <form (ngSubmit)="guardarAnalisis()" class="form-flow">
        
        <!-- SECCIÓN 1: DATOS DE LA MUESTRA -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <div>
              <h3>1. Información del Lote & Muestra</h3>
              <p>Identificación del producto para análisis analítico en laboratorio</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Vincular Lote en Producción</label>
              <select [(ngModel)]="formData.lote" name="loteSelector" (change)="onLoteChange()" class="form-select font-mono font-bold">
                <option value="">-- Seleccionar Lote Fabricado --</option>
                <option *ngFor="let fab of data.fabricaciones()" [value]="fab.lote">
                  {{ fab.lote }} • {{ fab.nombreProducto }}
                </option>
                <option *ngFor="let ped of data.pedidos()" [value]="ped.loteAsignado">
                  {{ ped.loteAsignado }} • {{ ped.productoNombre }} ({{ ped.numeroPedido }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Número de Lote a Analizar <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.lote" name="lote" required placeholder="LOT-SH-2026-001" class="form-input font-mono font-bold" />
            </div>

            <div class="form-group">
              <label>Nombre del Producto <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.nombreProducto" name="nombreProducto" required placeholder="Sérum Ácido Hialurónico 2%" class="form-input font-bold" />
            </div>

            <div class="form-group">
              <label>Marca / Línea <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.marca" name="marca" required placeholder="BioTrace Derma" class="form-input" />
            </div>

            <div class="form-group">
              <label>Tipo de Muestra <span class="req-star">*</span></label>
              <select [(ngModel)]="formData.tipoMuestra" name="tipoMuestra" class="form-select">
                <option value="Granel (Post-mezclado)">Granel (Post-mezclado en reactor)</option>
                <option value="Producto Terminado">Producto Terminado (Envasado final)</option>
                <option value="Materia Prima">Materia Prima en Recepción</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de Análisis <span class="req-star">*</span></label>
              <input type="date" [(ngModel)]="formData.fecha" name="fecha" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Analista Responsable <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.analista" name="analista" required class="form-input font-bold" />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: ENSAYOS FÍSICO-QUÍMICOS -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--emerald">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div style="flex: 1;">
              <h3>2. Ensayos y Parámetros Físico-Químicos</h3>
              <p>Verificación técnica de conformidad contra especificación galénica</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="agregarParametro()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Agregar Parámetro</span>
            </button>
          </div>

          <div class="table-wrap">
            <table class="params-table">
              <thead>
                <tr>
                  <th style="min-width: 240px;">Parámetro Analítico *</th>
                  <th style="min-width: 240px;">Especificación Técnica *</th>
                  <th style="min-width: 200px;">Resultado Obtenido *</th>
                  <th style="width: 140px; text-align: center;">Dictamen</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of parametros; let i = index">
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="p.parametro"
                      [name]="'param_' + i"
                      class="param-input font-bold"
                      placeholder="Nombre del parámetro..."
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="p.especificacion"
                      [name]="'spec_' + i"
                      class="param-input text-muted"
                      placeholder="Rango o criterio..."
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="p.resultado"
                      [name]="'res_' + i"
                      class="param-input font-bold"
                      placeholder="Valor medido en lab..."
                      style="color: #0891b2;"
                      required
                    />
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      class="badge-toggle"
                      [class.badge-toggle--ok]="p.cumple"
                      [class.badge-toggle--fail]="!p.cumple"
                      (click)="p.cumple = !p.cumple"
                    >
                      {{ p.cumple ? '✓ Cumple' : '✕ No cumple' }}
                    </button>
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      *ngIf="parametros.length > 1"
                      class="btn-delete-row"
                      (click)="eliminarParametro(i)"
                      title="Eliminar parámetro"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN 3: DICTAMEN DE LIBERACIÓN -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3>3. Dictamen Final de Liberación & Certificado COA</h3>
              <p>Aprobación técnica de aseguramiento de calidad (QA)</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Dictamen de Calidad <span class="req-star">*</span></label>
              <select [(ngModel)]="formData.dictamen" name="dictamen" class="form-select font-bold">
                <option value="APROBADO / LIBERADO">APROBADO / LIBERADO (Apto para pase a envasado y despacho)</option>
                <option value="EN CUARENTENA">EN CUARENTENA (Pendiente de cultivo microbiológico)</option>
                <option value="RECHAZADO">RECHAZADO (Fuera de especificación técnica)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Firma / Dirección Técnica <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.firmadoPor" name="firmadoPor" required class="form-input font-bold" />
            </div>

            <div class="form-group full-width">
              <label>Observaciones de Liberación</label>
              <textarea
                [(ngModel)]="formData.observaciones"
                name="observaciones"
                rows="3"
                class="form-textarea"
                placeholder="El producto analizado satisface los rangos de especificación técnica de la farmacopea..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- BOTONES -->
        <div class="form-submit-bar">
          <a routerLink="/trazabilidad/estaciones/control-calidad/registros" class="btn btn-secondary">
            Cancelar
          </a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Guardando dictamen...' : 'Guardar Análisis & Liberar' }}</span>
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
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
      overflow: hidden;
    }
    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #fcfdfe;
    }
    .card-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .card-header p {
      font-size: 0.78rem;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .card-header-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon--cyan { background: #ecfeff; color: #0891b2; }
    .icon--emerald { background: #f0fdf4; color: #16a34a; }
    .icon--purple { background: #faf5ff; color: #9333ea; }

    .inputs-grid {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.15rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }
    .req-star {
      color: #dc2626;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      border: 1.5px solid #cbd5e1;
      font-size: 0.875rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }

    /* TABLA DE PARÁMETROS */
    .table-wrap {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      overflow-x: auto;
    }
    .params-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .params-table th {
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
    .params-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .param-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
    }
    .param-input:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15);
    }
    .badge-toggle {
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .badge-toggle--ok {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .badge-toggle--fail {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .btn-delete-row {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .btn-delete-row:hover {
      background: #fee2e2;
    }

    /* BARRA DE ACCIONES */
    .form-submit-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 0.5rem;
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
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-muted { color: #64748b; }
  `]
})
export class CalidadFormatoComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMessage = signal(false);

  formData = {
    numeroPedido: '',
    lote: '',
    nombreProducto: '',
    marca: 'BioTrace',
    tipoMuestra: 'Granel (Post-mezclado en reactor)',
    fecha: new Date().toISOString().split('T')[0],
    analista: this.auth.currentUser()?.name || '',
    dictamen: 'APROBADO / LIBERADO' as const,
    firmadoPor: '',
    observaciones: ''
  };

  parametros: ParametroCalidad[] = [
    { parametro: 'Densidad a 20°C (g/mL)', especificacion: '1.000 - 1.050', resultado: '', cumple: true },
    { parametro: 'pH a 25°C', especificacion: '5.00 - 6.50', resultado: '', cumple: true },
    { parametro: 'Aspecto Organoléptico', especificacion: 'Líquido / emulsión homogénea', resultado: '', cumple: true },
    { parametro: 'Recuento Microbiológico', especificacion: '< 100 UFC/g', resultado: '', cumple: true }
  ];

  ngOnInit() {
    const fabs = this.data.fabricaciones();
    if (fabs.length > 0) {
      this.formData.lote = fabs[0].lote;
      this.formData.nombreProducto = fabs[0].nombreProducto;
      this.formData.marca = fabs[0].marca;
      this.formData.numeroPedido = fabs[0].numeroPedido;
    } else {
      const peds = this.data.pedidos();
      if (peds.length > 0) {
        this.formData.numeroPedido = peds[0].numeroPedido;
        this.formData.lote = peds[0].loteAsignado;
        this.formData.nombreProducto = peds[0].productoNombre;
      }
    }
  }

  onLoteChange() {
    if (!this.formData.lote) return;
    const fab = this.data.fabricaciones().find(f => f.lote === this.formData.lote);
    if (fab) {
      this.formData.nombreProducto = fab.nombreProducto;
      this.formData.marca = fab.marca;
      this.formData.numeroPedido = fab.numeroPedido;
      return;
    }
    const ped = this.data.pedidos().find(p => p.loteAsignado === this.formData.lote);
    if (ped) {
      this.formData.nombreProducto = ped.productoNombre;
      this.formData.numeroPedido = ped.numeroPedido;
    }
  }

  agregarParametro() {
    this.parametros.push({
      parametro: '',
      especificacion: '',
      resultado: '',
      cumple: true
    });
  }

  eliminarParametro(index: number) {
    this.parametros.splice(index, 1);
  }

  guardarAnalisis() {
    this.isSaving.set(true);

    const nuevoQc: CalidadRecord = {
      id: `QC-${Date.now().toString().slice(-4)}`,
      lote: this.formData.lote,
      numeroPedido: this.formData.numeroPedido,
      nombreProducto: this.formData.nombreProducto,
      marca: this.formData.marca,
      fecha: this.formData.fecha,
      tipoMuestra: this.formData.tipoMuestra,
      dictamen: this.formData.dictamen,
      analista: this.formData.analista,
      firmadoPor: this.formData.firmadoPor,
      numeroCoa: `COA-2026-${Math.floor(100 + Math.random() * 900)}`,
      parametros: this.parametros.map(p => ({ ...p })),
      observaciones: this.formData.observaciones
    };

    setTimeout(() => {
      this.data.addCalidad(nuevoQc);
      this.isSaving.set(false);
      this.successMessage.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/estaciones/control-calidad/registros');
      }, 1400);
    }, 700);
  }
}
