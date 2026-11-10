import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, IngresoMpRecord } from '../../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-mp-ingreso-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER OFICIAL -->
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
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Ingreso Materia Prima — Registros</h1>
            <p class="station-desc">Histórico y trazabilidad de lotes de insumos recibidos con inspección de calidad y certificado COA.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/materia-prima/ingreso/formato" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Llenar formato de ingreso</span>
        </a>
      </header>

      <!-- BARRA DE FILTROS -->
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
              placeholder="Buscar por lote interno, insumo, proveedor o COA..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroEstado">
              <option value="TODOS">Todos los estados</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Cuarentena">Cuarentena</option>
              <option value="Rechazado">Rechazado</option>
            </select>

            <input type="date" class="filter-date" [(ngModel)]="filtroFecha" />

            <button
              *ngIf="searchTerm || filtroEstado !== 'TODOS' || filtroFecha"
              type="button"
              class="btn-clear"
              (click)="limpiarFiltros()"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- TABLA DE REGISTROS -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lote Interno</th>
                <th>Materia Prima / Insumo</th>
                <th>Proveedor Homologado</th>
                <th>Lote Prov.</th>
                <th>Cantidad</th>
                <th>F. Recepción</th>
                <th>F. Vence</th>
                <th>Estado Calidad</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag">{{ reg.loteInterno }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <strong style="color: #0f172a;">{{ reg.producto }}</strong>
                    <span style="font-size: 0.72rem; color: #64748b;">Código: {{ reg.codigoInsumo }}</span>
                  </div>
                </td>
                <td>{{ reg.proveedor }}</td>
                <td><span class="code-tag">{{ reg.loteProveedor }}</span></td>
                <td>
                  <strong style="color: #0f172a;">{{ reg.cantidadRecibida }} {{ reg.unidades }}</strong>
                </td>
                <td>{{ reg.fechaRecepcion }}</td>
                <td>{{ reg.fechaVencimiento }}</td>
                <td>
                  <span
                    class="status-badge"
                    [class.status-badge--success]="reg.estadoCalidad === 'Aprobado'"
                    [class.status-badge--warning]="reg.estadoCalidad === 'Cuarentena'"
                    [class.status-badge--danger]="reg.estadoCalidad === 'Rechazado'"
                  >
                    {{ reg.estadoCalidad }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver detalle completo">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--edit" (click)="editarRegistro(reg)" title="Editar registro">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button type="button" class="action-btn action-btn--delete" (click)="confirmarEliminar(reg)" title="Eliminar registro">
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

    <!-- MODAL DETALLE COMPLETO (NO PLANO, ELEGANTE) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div>
              <h3>Ficha Técnica de Recepción — Lote {{ selectedItem()?.loteInterno }}</h3>
              <p>{{ selectedItem()?.producto }} • Código: {{ selectedItem()?.codigoInsumo }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <!-- METADATA GRID -->
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">PROVEEDOR HOMOLOGADO</span>
              <span class="meta-value">{{ item.proveedor }}</span>
              <span class="meta-sub">Lote Prov: {{ item.loteProveedor }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">CANTIDAD Y PRECIO</span>
              <span class="meta-value">{{ item.cantidadRecibida }} {{ item.unidades }}</span>
              <span class="meta-sub">Valor: $ {{ (item.costoTotal || 0).toLocaleString('es-CO') }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">ESTADO DE CALIDAD</span>
              <span class="meta-value" style="color: #0891b2;">{{ item.estadoCalidad }}</span>
              <span class="meta-sub">Vence: {{ item.fechaVencimiento }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">LIBERADO POR</span>
              <span class="meta-value">{{ item.liberadoPor }}</span>
              <span class="meta-sub">F. Recepción: {{ item.fechaRecepcion }}</span>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Certificado de Análisis (COA) de Origen</h4>
            <div class="modal-obs-card">
              <p style="margin: 0 0 4px 0;"><strong>Archivo Adjunto:</strong> {{ item.coaArchivo }}</p>
              <p style="margin: 0; color: #475569;"><strong>Aspecto Organoléptico:</strong> {{ item.aspecto }}</p>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Observaciones de Recepción Técnica</h4>
            <div class="modal-obs-card" style="border-left-color: #10b981;">
              {{ item.observaciones }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR REGISTRO -->
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
              <h3>Editar Lote de Materia Prima</h3>
              <p>Formato completo de recepción técnica — Lote Interno: {{ editItem()?.loteInterno }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <!-- SECCIÓN 1: HOMOLOGACIÓN E IDENTIFICACIÓN -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">1. Identificación y Homologación del Insumo</span>
              <span class="modal-fieldset-badge">GMP / BPM</span>
            </div>
            <div class="modal-form-grid modal-form-grid--3">
              <div class="modal-field">
                <label class="modal-field-label">Lote Interno BioTrace <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.loteInterno" class="modal-field-input" placeholder="LOT-MP-..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Materia Prima / Insumo <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.producto" class="modal-field-input" placeholder="Nombre comercial / INCI" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Código Interno Insumo <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.codigoInsumo" class="modal-field-input" placeholder="MP-..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Proveedor Homologado <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.proveedor" class="modal-field-input" placeholder="Laboratorio proveedor" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Lote del Fabricante / Prov. <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.loteProveedor" class="modal-field-input" placeholder="Lote externo" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Aspecto Organoléptico</label>
                <input type="text" [(ngModel)]="item.aspecto" class="modal-field-input" placeholder="Polvo blanco, líquido..." />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: CANTIDADES, COSTOS Y FECHAS -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">2. Cantidad, Costos y Control de Vencimiento</span>
              <span class="modal-fieldset-badge">Balanza Calibrada</span>
            </div>
            <div class="modal-form-grid modal-form-grid--4">
              <div class="modal-field">
                <label class="modal-field-label">Cantidad Recibida <span class="req">*</span></label>
                <input type="number" [(ngModel)]="item.cantidadRecibida" (ngModelChange)="actualizarCosto()" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Unidad de Medida <span class="req">*</span></label>
                <select [(ngModel)]="item.unidades" class="modal-field-select">
                  <option value="Kg">Kg (Kilogramos)</option>
                  <option value="L">L (Litros)</option>
                  <option value="g">g (Gramos)</option>
                  <option value="mL">mL (Mililitros)</option>
                </select>
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Precio Unitario ($)</label>
                <input type="number" [(ngModel)]="item.precioUnitario" (ngModelChange)="actualizarCosto()" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Costo Total ($)</label>
                <input type="number" [(ngModel)]="item.costoTotal" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Fecha de Recepción <span class="req">*</span></label>
                <input type="date" [(ngModel)]="item.fechaRecepcion" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Fecha de Vencimiento <span class="req">*</span></label>
                <input type="date" [(ngModel)]="item.fechaVencimiento" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Liberado Por (Analista / QA) <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.liberadoPor" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Certificado COA (Archivo / Nº)</label>
                <input type="text" [(ngModel)]="item.coaArchivo" class="modal-field-input" placeholder="COA-..." />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: DICTAMEN DE CALIDAD & OBSERVACIONES -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">3. Estado de Calidad & Observaciones</span>
              <span class="modal-fieldset-badge" [style.color]="item.estadoCalidad === 'Aprobado' ? '#16a34a' : item.estadoCalidad === 'Cuarentena' ? '#d97706' : '#dc2626'">
                {{ item.estadoCalidad }}
              </span>
            </div>
            <div class="modal-form-grid">
              <div class="modal-field">
                <label class="modal-field-label">Estado de Liberación de Calidad <span class="req">*</span></label>
                <select [(ngModel)]="item.estadoCalidad" class="modal-field-select">
                  <option value="Aprobado">Aprobado</option>
                  <option value="Cuarentena">Cuarentena</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
              <div class="modal-field modal-form-grid--full">
                <label class="modal-field-label">Observaciones Técnicas de Recepción</label>
                <textarea [(ngModel)]="item.observaciones" rows="3" class="modal-field-textarea" placeholder="Novedades de embalaje, sellos de seguridad intactos, etc."></textarea>
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
        <h4>¿Eliminar registro de ingreso?</h4>
        <p>Está a punto de eliminar el lote <strong>{{ itemToDelete()?.loteInterno }}</strong> ({{ itemToDelete()?.producto }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../../shared/styles/registros-common.css']
})
export class MpIngresoRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroEstado = 'TODOS';
  filtroFecha = '';

  selectedItem = signal<IngresoMpRecord | null>(null);
  editItem = signal<IngresoMpRecord | null>(null);
  itemToDelete = signal<IngresoMpRecord | null>(null);

  filteredRecords(): IngresoMpRecord[] {
    const list = this.data.ingresosMp();
    const term = this.searchTerm.toLowerCase().trim();
    const estado = this.filtroEstado;
    const fecha = this.filtroFecha;

    return list.filter(r => {
      const matchText = !term ||
        r.loteInterno.toLowerCase().includes(term) ||
        r.producto.toLowerCase().includes(term) ||
        r.proveedor.toLowerCase().includes(term) ||
        r.loteProveedor.toLowerCase().includes(term) ||
        r.coaArchivo.toLowerCase().includes(term);

      const matchEstado = estado === 'TODOS' || r.estadoCalidad === estado;
      const matchFecha = !fecha || r.fechaRecepcion === fecha;

      return matchText && matchEstado && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroEstado = 'TODOS';
    this.filtroFecha = '';
  }

  verDetalle(item: IngresoMpRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: IngresoMpRecord) {
    this.editItem.set({ ...item });
  }

  actualizarCosto() {
    const it = this.editItem();
    if (it) {
      const cant = Number(it.cantidadRecibida) || 0;
      const precio = Number(it.precioUnitario) || 0;
      it.costoTotal = Number((cant * precio).toFixed(2));
    }
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateIngresoMp(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: IngresoMpRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteIngresoMp(it.id);
      this.itemToDelete.set(null);
    }
  }
}
