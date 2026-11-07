import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../../../../core/services/api.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { MaterialRecord } from '../../../../../../core/models/traceability.models';

@Component({
  selector: 'app-mp-ingreso-formato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-MP-01</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Ingreso Materia Prima — Llenar Formato</h1>
            <p class="station-desc">Recepción técnica y homologación de insumos con número de lote interno, peso neto recibido y certificado de análisis (COA).</p>
          </div>
        </div>
        <div class="station-header-actions">
          <div class="station-tab-pills">
            <a class="tab-pill tab-pill--active" style="text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
              </svg>
              <span>Llenar formato</span>
            </a>
            <a class="tab-pill" routerLink="/trazabilidad/estaciones/materia-prima/ingreso/registros" style="text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <span>Ver registros</span>
            </a>
          </div>
        </div>
      </header>

      <div *ngIf="feedbackMessage()" class="alert-feedback-banner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ feedbackMessage() }}</span>
      </div>

      <div class="form-view-container">
                          <form  (ngSubmit)="guardarIngresoMP()" class="form-flow">
            
            <!-- Card 1: Identificación y Homologación -->
            <div class="lap-card">
              <div class="lap-card__header">
                <div class="lap-card__title-wrap">
                  <div class="lap-card__icon-box">1</div>
                  <div>
                    <h3 class="lap-card__title">Identificación y Homologación del Insumo</h3>
                    <p class="lap-card__subtitle">Datos técnicos de origen y laboratorio homologado bajo norma GMP</p>
                  </div>
                </div>
              </div>

              <div class="form-grid form-grid--3">
                <div class="form-field">
                  <label class="field-label">Materia Prima / Principio Activo <span class="req">*</span></label>
                  <input [(ngModel)]="formMp.producto" name="producto" class="field-input" [disabled]="true" />
                </div>

                <div class="form-field">
                  <label class="field-label">Código Interno de Insumo <span class="req">*</span></label>
                  <select [(ngModel)]="formMp.codigoInsumo" (ngModelChange)="seleccionarMateriaPrima()" name="codigoInsumo" required class="field-select"><option *ngFor="let material of materials" [value]="material.codigo_materia_prima">{{material.codigo_materia_prima}} / {{material.nombre_insumo}}</option></select>
                </div>

                <div class="form-field">
                  <label class="field-label">Proveedor Homologado <span class="req">*</span></label>
                  <select [(ngModel)]="formMp.proveedor" name="proveedor" required class="field-select">
                    <option value="Merck KGaA Laboratorios">Merck KGaA Laboratorios (Alemania)</option>
                    <option value="BASF Nutrition & Health">BASF Nutrition & Health</option>
                    <option value="Croda Personal Care">Croda Personal Care</option>
                    <option value="Evonik Industries AG">Evonik Industries AG</option>
                    <option value="Givaudan Active Beauty">Givaudan Active Beauty</option>
                    <option value="Indena Pharma Extracts">Indena Pharma Extracts</option>
                  </select>
                </div>

                <div class="form-field">
                  <label class="field-label">Orden de Compra / Remisión <span class="req">*</span></label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.ordenCompra"
                    name="ordenCompra"
                    placeholder="OC-2026-9041"
                    class="field-input font-mono"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">País / Laboratorio Fabricante</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.paisOrigen"
                    name="paisOrigen"
                    placeholder="Alemania (Darmstadt)"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Tipo de Grado Farmacopéico</label>
                  <select class="field-select">
                    <option value="USP">Grado USP (United States Pharmacopeia)</option>
                    <option value="EP">Grado EP (European Pharmacopoeia)</option>
                    <option value="COSMETICO">Grado Cosmético Certificado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Card 2: Control de Lote, Cantidad & Fechas -->
            <div class="lap-card">
              <div class="lap-card__header">
                <div class="lap-card__title-wrap">
                  <div class="lap-card__icon-box">2</div>
                  <div>
                    <h3 class="lap-card__title">Control de Lote, Cantidad Recibida & Fechas</h3>
                    <p class="lap-card__subtitle">Trazabilidad por lote y balance estricto de pesada de ingreso</p>
                  </div>
                </div>
              </div>

              <div class="form-grid form-grid--3">
                <div class="form-field">
                  <label class="field-label">Lote del Fabricante / Proveedor <span class="req">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formMp.loteProveedor"
                    name="loteProveedor"
                    required
                    placeholder="LOT-MERCK-8831"
                    class="field-input font-mono"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Lote Interno Asignado <span class="req">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formMp.loteInterno"
                    name="loteInterno"
                    required
                    placeholder="MP-2026-0512"
                    class="field-input font-mono"
                  />
                </div>

                <!-- Grupo Cantidad + Selector de Unidad Conectado -->
                <div class="form-field">
                  <label class="field-label">Cantidad Recibida & Unidad <span class="req">*</span></label>
                  <div class="quantity-unit-group">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      [(ngModel)]="formMp.cantidadRecibida"
                      name="cantidadRecibida"
                      required
                      placeholder="25.000"
                      class="field-input group-input"
                    />
                    <input [(ngModel)]="formMp.unidades" name="unidades" class="field-input" [disabled]="true" />
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">Precio Unitario ($ / Unidad)</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="number"
                    step="100"
                    [(ngModel)]="formMp.precioPorUnidad"
                    name="precioPorUnidad"
                    placeholder="185000"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Fecha de Recepción en Planta <span class="req">*</span></label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="date"
                    [(ngModel)]="formMp.fechaRecepcion"
                    name="fechaRecepcion"
                    required
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Fecha de Vencimiento / Reanálisis <span class="req">*</span></label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="date"
                    [(ngModel)]="formMp.fechaVencimiento"
                    name="fechaVencimiento"
                    required
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Resumen de Costo Total Calculado -->
              <div class="cost-summary-box">
                <div class="cost-summary-item">
                  <span class="cost-summary-label">CANTIDAD REGISTRADA</span>
                  <span class="cost-summary-value">{{ formMp.cantidadRecibida || 0 }} {{ formMp.unidades }}</span>
                </div>
                <div class="cost-summary-item">
                  <span class="cost-summary-label">PRECIO BASE UNITARIO</span>
                  <span class="cost-summary-value">$ {{ (formMp.precioPorUnidad || 0).toLocaleString('es-CO') }} / {{ formMp.unidades }}</span>
                </div>
                <div class="cost-summary-item cost-summary-item--highlight">
                  <span class="cost-summary-label">VALOR TOTAL DE ENTRADA</span>
                  <span class="cost-summary-total">$ {{ ((formMp.cantidadRecibida || 0) * (formMp.precioPorUnidad || 0)).toLocaleString('es-CO') }}</span>
                </div>
              </div>
            </div>

            <!-- Card 3: Criterios de Calidad GMP & Certificado COA -->
            <div class="lap-card">
              <div class="lap-card__header">
                <div class="lap-card__title-wrap">
                  <div class="lap-card__icon-box">3</div>
                  <div>
                    <h3 class="lap-card__title">Criterios de Calidad Organoléptica & COA</h3>
                    <p class="lap-card__subtitle">Verificación sensorial y adjunto de Certificado de Análisis del Fabricante</p>
                  </div>
                </div>
              </div>

              <div class="form-grid form-grid--3">
                <div class="form-field">
                  <label class="field-label">Aspecto Físico</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.aspecto"
                    name="aspecto"
                    placeholder="Polvo cristalino homogéneo"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Color & Olor</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.colorOlor"
                    name="colorOlor"
                    placeholder="Inodoro / Blanco puro característico"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">pH / Densidad / Pureza</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.phDensidad"
                    name="phDensidad"
                    placeholder="pH: 6.45 (solución 1%) / Pureza: 99.2%"
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Uploader de Certificado de Análisis (COA) -->
              <div class="coa-dropzone-box">
                <div class="coa-dropzone-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div class="coa-dropzone-info">
                  <strong>Certificado de Análisis (COA) del Fabricante</strong>
                  <span>Archivo vinculado: {{ formMp.coaArchivo }} (Verificado conforme especificación USP)</span>
                </div>
                <span class="badge-approved-tag">COA VERIFICADO</span>
              </div>

              <!-- Dictamen de Calidad Inicial (Titanio & Cian Glacial, SIN ROJO NI AMARILLO) -->
              <div class="status-selection-wrap">
                <label class="field-label">Dictamen de Calidad Inicial en Recepción:</label>
                <div class="status-btn-group">
                  <button
                    type="button"
                    class="status-choice-btn"
                    [class.status-choice-btn--approved]="formMp.estadoCalidad === 'Aprobado'"
                    (click)="formMp.estadoCalidad = 'Aprobado'"
                  >
                    <span class="status-dot-approved"></span>
                    <span>Aprobado (Liberado a Planta)</span>
                  </button>

                  <button
                    type="button"
                    class="status-choice-btn"
                    [class.status-choice-btn--quarantine]="formMp.estadoCalidad === 'Cuarentena'"
                    (click)="formMp.estadoCalidad = 'Cuarentena'"
                  >
                    <span class="status-dot-quarantine"></span>
                    <span>En Cuarentena (En Análisis)</span>
                  </button>

                  <button
                    type="button"
                    class="status-choice-btn"
                    [class.status-choice-btn--rejected]="formMp.estadoCalidad === 'Rechazado'"
                    (click)="formMp.estadoCalidad = 'Rechazado'"
                  >
                    <span class="status-dot-rejected"></span>
                    <span>Rechazado (No Conforme)</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 4: Despeje de Área & Responsable -->
            <div class="lap-card">
              <div class="lap-card__header">
                <div class="lap-card__title-wrap">
                  <div class="lap-card__icon-box">4</div>
                  <div>
                    <h3 class="lap-card__title">Despeje de Área & Responsable de Recepción</h3>
                    <p class="lap-card__subtitle">Registro de condiciones de pesada y químico farmacéutico receptor</p>
                  </div>
                </div>
              </div>

              <div class="form-grid form-grid--3">
                <div class="form-field">
                  <label class="field-label">Analista / Químico Receptor</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.liberadoPor"
                    name="liberadoPor"
                    readonly
                    class="field-input field-input--readonly"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Temperatura de Recepción</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.temperatura"
                    name="temperatura"
                    placeholder="20.5 °C"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">Humedad Relativa (% HR)</label>
                  <input [disabled]="true" title="Campo no disponible en el registro actual"
                    type="text"
                    [(ngModel)]="formMp.humedad"
                    name="humedad"
                    placeholder="45 % HR"
                    class="field-input"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label class="field-label">Observaciones Técnicas de Empaque y Precinto</label>
                  <textarea [disabled]="true" title="Campo no disponible en el registro actual"
                    [(ngModel)]="formMp.observaciones"
                    name="observaciones"
                    rows="3"
                    class="field-textarea"
                    placeholder="Empaque hermético de grado farmacéutico, rotulación conforme y lote coincidente."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Acciones de Pie de Formulario -->
            <div class="form-actions-bar">
              <button [disabled]="readOnly()" type="submit" class="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Guardar y Registrar Entrada GMP</span>
              </button>

              <button type="button" (click)="resetFormMp()" class="btn btn-secondary">
                <span>Limpiar Formulario</span>
              </button>

              <button type="button" routerLink="/trazabilidad/estaciones/materia-prima/ingreso/registros" class="btn btn-text">
                <span>Ir a Ver Registros</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </form>
      </div>
    </div>
  `
})
export class MpIngresoFormatoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);
  feedbackMessage = signal<string | null>(null);
  readOnly = signal<boolean>(false);
  materials: MaterialRecord[] = [];

  formMp = {
    producto: 'Ácido Hialurónico Puro 2%',
    codigoInsumo: 'MP-AH-001',
    proveedor: 'Merck KGaA Laboratorios',
    ordenCompra: 'OC-2026-9041',
    paisOrigen: 'Alemania (Darmstadt)',
    loteProveedor: 'LOT-MERCK-8831',
    loteInterno: 'MP-2026-0512',
    cantidadRecibida: 25.5,
    unidades: 'kg',
    precioPorUnidad: 185000,
    fechaRecepcion: '2026-10-20',
    fechaFabricacion: '2026-08-15',
    fechaVencimiento: '2028-08-15',
    aspecto: 'Polvo microcristalino blanco homogéneo',
    colorOlor: 'Inodoro / Blanco puro característico',
    phDensidad: 'pH: 6.45 (solución 1%) / Pureza: 99.2%',
    coaArchivo: 'COA-MERCK-AH-8831.pdf',
    estadoCalidad: 'Aprobado' as 'Aprobado' | 'Cuarentena' | 'Rechazado',
    liberadoPor: 'admin@biotrace.com (Ing. Administrador)',
    temperatura: '20.5 °C',
    humedad: '45 % HR',
    observaciones: 'Empaque trilaminado de aluminio sellado herméticamente al vacío. Certificado de análisis verificado conforme USP.'
  };

  async ngOnInit() {
    try {
      this.materials = await firstValueFrom(this.api.list<MaterialRecord>('materials'));
    } catch (err) {
      this.feedbackMessage.set(err instanceof HttpErrorResponse ? err.error?.error || 'Error al cargar' : 'Error');
    }
  }

  seleccionarMateriaPrima() {
    const material = this.materials.find(m => m.codigo_materia_prima === this.formMp.codigoInsumo);
    this.formMp.producto = material?.nombre_insumo ?? '';
    this.formMp.unidades = material?.unidad_medida ?? '';
  }

  async guardarIngresoMP() {
    const material = this.materials.find(m => m.codigo_materia_prima === this.formMp.codigoInsumo);
    if (!material) {
      this.feedbackMessage.set('Registre primero la materia prima con ese código.');
      return;
    }
    try {
      await firstValueFrom(this.api.create('ingresos-mp', {
        materia_prima_id: material.id,
        lote_interno: this.formMp.loteInterno,
        lote_proveedor: this.formMp.loteProveedor,
        cantidad_recibida: Number(this.formMp.cantidadRecibida),
        proveedor: this.formMp.proveedor
      }));
      this.router.navigate(['/trazabilidad/estaciones/materia-prima/ingreso/registros']);
    } catch (err) {
      this.feedbackMessage.set(err instanceof HttpErrorResponse ? err.error?.error || 'Error al guardar' : 'Error al guardar');
    }
  }

  resetFormMp() {
    this.formMp.producto = '';
    this.formMp.loteProveedor = '';
    this.formMp.loteInterno = 'MP-2026-' + Math.floor(1000 + Math.random() * 9000);
    this.formMp.cantidadRecibida = 10;
  }
}
