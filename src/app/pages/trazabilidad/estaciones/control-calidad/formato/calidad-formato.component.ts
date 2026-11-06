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
      <div class="page-header">
        <div class="header-left">
          <div class="header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <span>CONTROL DE CALIDAD • LABORATORIO QC/QA</span>
          </div>
          <h1 class="header-title">Control de Calidad (Llenar Formato)</h1>
          <p class="header-desc">
            Ensayos físico-químicos de producto a granel o terminado y emisión de dictamen de liberación.
          </p>
        </div>

        <div class="header-right">
          <a routerLink="/trazabilidad/estaciones/control-calidad/registros" class="btn btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver historial de análisis</span>
          </a>
        </div>
      </div>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMessage()" class="alert alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Análisis de calidad registrado y certificado generado!</strong>
          <p>El dictamen ha sido emitido y archivado en los registros BPM.</p>
        </div>
      </div>

      <!-- FORMULARIO DE CALIDAD -->
      <form (ngSubmit)="guardarAnalisis()" class="form-layout">
        
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
              <p>Identificación del producto para análisis en laboratorio</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Lote a Analizar *</label>
              <input type="text" [(ngModel)]="formData.lote" name="lote" required placeholder="LOT-SH-2026-001" class="form-input" />
            </div>

            <div class="form-group">
              <label>Nombre del Producto *</label>
              <input type="text" [(ngModel)]="formData.nombreProducto" name="nombreProducto" required placeholder="Sérum Ácido Hialurónico 2%" class="form-input" />
            </div>

            <div class="form-group">
              <label>Marca *</label>
              <input type="text" [(ngModel)]="formData.marca" name="marca" required placeholder="BioTrace Derma" class="form-input" />
            </div>

            <div class="form-group">
              <label>Tipo de Muestra *</label>
              <select [(ngModel)]="formData.tipoMuestra" name="tipoMuestra" class="form-select">
                <option value="Granel (Post-mezclado)">Granel (Post-mezclado en reactor)</option>
                <option value="Producto Terminado">Producto Terminado (Envasado final)</option>
                <option value="Materia Prima">Materia Prima en Recepción</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de Análisis *</label>
              <input type="date" [(ngModel)]="formData.fecha" name="fecha" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Analista Responsable *</label>
              <input type="text" [(ngModel)]="formData.analista" name="analista" required class="form-input" />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: ENSAYOS FÍSICO-QUÍMICOS (LAPROBELL SPEC) -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--emerald">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div>
              <h3>2. Ensayos y Parámetros Físico-Químicos</h3>
              <p>Verificación técnica de conformidad contra especificación galénica</p>
            </div>
          </div>

          <div class="table-wrap">
            <table class="params-table">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Especificación Técnica</th>
                  <th>Resultado Obtenido</th>
                  <th style="width: 140px; text-align: center;">Dictamen</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of parametros; let i = index">
                  <td class="font-bold">{{ p.parametro }}</td>
                  <td class="text-muted">{{ p.especificacion }}</td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="p.resultado"
                      [name]="'res_' + i"
                      class="param-input"
                      placeholder="Valor medido..."
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
              <h3>3. Dictamen Final de Liberación</h3>
              <p>Aprobación técnica de aseguramiento de calidad (QA)</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Dictamen de Calidad *</label>
              <select [(ngModel)]="formData.dictamen" name="dictamen" class="form-select font-bold">
                <option value="APROBADO / LIBERADO">APROBADO / LIBERADO (Apto para pase a envasado)</option>
                <option value="EN CUARENTENA">EN CUARENTENA (Pendiente de cultivo microbiológico)</option>
                <option value="RECHAZADO">RECHAZADO (Fuera de especificación técnica)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Firma / Dirección Técnica *</label>
              <input type="text" [(ngModel)]="formData.firmadoPor" name="firmadoPor" class="form-input" />
            </div>

            <div class="form-group full-width">
              <label>Observaciones de Liberación</label>
              <textarea
                [(ngModel)]="formData.observaciones"
                name="observaciones"
                rows="3"
                class="form-textarea"
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
  styles: [`
    .page-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 1.25rem 2rem 3rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-sizing: border-box;
    }
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 0.5rem;
    }
    .header-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
      letter-spacing: -0.02em;
    }
    .header-desc {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0;
    }
    .form-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
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
      gap: 0.35rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.85rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }
    .table-wrap {
      padding: 1.25rem 1.5rem;
      overflow-x: auto;
    }
    .params-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
    }
    .params-table th {
      background: #f8fafc;
      padding: 0.75rem 0.85rem;
      text-align: left;
      font-weight: 700;
      color: #475569;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .params-table td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .param-input {
      width: 100%;
      padding: 0.45rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.8rem;
      outline: none;
    }
    .param-input:focus {
      border-color: #0891b2;
    }
    .badge-toggle {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .badge-toggle--ok {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .badge-toggle--fail {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .form-submit-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.65rem 1.4rem;
      border-radius: 9px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #0891b2;
      color: #ffffff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0e7490;
    }
    .btn-secondary {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #475569;
    }
    .btn-outline {
      background: #ffffff;
      border-color: #e2e8f0;
      color: #0f172a;
    }
    .alert--success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
    }
    .font-bold { font-weight: 700; }
    .text-muted { color: #64748b; font-size: 0.78rem; }
  `]
})
export class CalidadFormatoComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMessage = signal(false);

  formData = {
    numeroPedido: 'PED-2026-001',
    lote: 'LOT-SH-2026-001',
    nombreProducto: 'Sérum Facial Ácido Hialurónico 2%',
    marca: 'BioTrace Derma Care',
    tipoMuestra: 'Granel (Post-mezclado en reactor)',
    fecha: new Date().toISOString().split('T')[0],
    analista: this.auth.currentUser()?.name || 'Dra. María Restrepo',
    dictamen: 'APROBADO / LIBERADO' as const,
    firmadoPor: 'Dra. Elena Ramírez (Dirección Técnica)',
    observaciones: 'El producto analizado satisface los rangos de especificación técnica de la farmacopea y registro sanitario.'
  };

  parametros: ParametroCalidad[] = [
    { parametro: 'Densidad a 20°C (g/mL)', especificacion: '1.010 - 1.040', resultado: '1.025', cumple: true },
    { parametro: 'pH a 25°C', especificacion: '5.50 - 6.50', resultado: '5.85', cumple: true },
    { parametro: 'Viscosidad Brookfield (cP)', especificacion: '2500 - 4500 cP (Sp 4, 20 RPM)', resultado: '3200 cP', cumple: true },
    { parametro: 'Aspecto Organoléptico', especificacion: 'Líquido viscoso homogéneo translúcido', resultado: 'Conforme', cumple: true },
    { parametro: 'Color & Olor', especificacion: 'Incoloro a ligeramente cristalino / Inodoro', resultado: 'Conforme', cumple: true },
    { parametro: 'Recuento Microbiológico', especificacion: '< 100 UFC/g (Ausencia patógenos)', resultado: '< 10 UFC/g', cumple: true }
  ];

  ngOnInit() {
    const peds = this.data.pedidos();
    if (peds.length > 0) {
      this.formData.numeroPedido = peds[0].numeroPedido;
      this.formData.lote = peds[0].loteAsignado;
      this.formData.nombreProducto = peds[0].productoNombre;
    }
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

