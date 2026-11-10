import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TraceabilityDataService, FabricacionRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-fabricacion-registros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER OFICIAL -->
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon station-badge-icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge" style="color: #9333ea; background: #faf5ff; border-color: #e9d5ff;">EST-03</span>
              <span class="station-cat-badge">Manufactura & Formulación</span>
            </div>
            <h1 class="station-title">Fabricación del Producto — Registros</h1>
            <p class="station-desc">Historial de órdenes procesadas en reactores, verificación de despeje de línea y parámetros de agitación.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/estaciones/fabricacion/formato" class="btn btn-primary" style="background: #9333ea;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Llenar formato de fabricación</span>
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
              placeholder="Buscar por lote, pedido, producto u operador..."
              [(ngModel)]="searchTerm"
            />
          </div>

          <div class="filter-group-right">
            <select class="filter-select" [(ngModel)]="filtroReactor">
              <option value="TODOS">Todos los reactores</option>
              <option value="Reactor R-101">Reactor R-101</option>
              <option value="Reactor R-102">Reactor R-102</option>
              <option value="Marmita M-01">Marmita M-01</option>
            </select>

            <input type="date" class="filter-date" [(ngModel)]="filtroFecha" />

            <button
              *ngIf="searchTerm || filtroReactor !== 'TODOS' || filtroFecha"
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
                <th>Lote Fabricado</th>
                <th>Pedido Vinculado</th>
                <th>Producto & Marca</th>
                <th>Reactor</th>
                <th>Tamaño Lote</th>
                <th>Despeje BPM</th>
                <th>Fases</th>
                <th>Operador</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of filteredRecords()">
                <td>
                  <span class="code-tag" style="background: #faf5ff; color: #7e22ce; border-color: #e9d5ff;">
                    {{ reg.lote }}
                  </span>
                </td>
                <td>
                  <span class="code-tag">{{ reg.numeroPedido }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <strong style="color: #0f172a;">{{ reg.nombreProducto }}</strong>
                    <span style="font-size: 0.72rem; color: #64748b;">{{ reg.marca }}</span>
                  </div>
                </td>
                <td>{{ reg.reactor }}</td>
                <td><strong>{{ reg.tamanoLoteKg }} Kg</strong></td>
                <td>
                  <span class="status-badge status-badge--success">
                    ✓ Conforme (7/7)
                  </span>
                </td>
                <td>
                  <span class="code-tag">{{ reg.totalPasos }} Fases</span>
                </td>
                <td><strong>{{ reg.operador }}</strong></td>
                <td>
                  <span class="status-badge status-badge--info">
                    {{ reg.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons-wrap">
                    <button type="button" class="action-btn action-btn--view" (click)="verDetalle(reg)" title="Ver fases completas">
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

    <!-- MODAL DETALLE DE FABRICACIÓN (RICO Y NO PLANO) -->
    <div class="modal-backdrop" *ngIf="selectedItem()" (click)="selectedItem.set(null)">
      <div class="modal-sheet modal-sheet--wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge station-badge-icon--purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h3>Ficha Técnica de Manufactura — Lote {{ selectedItem()?.lote }}</h3>
              <p>{{ selectedItem()?.nombreProducto }} • Orden: {{ selectedItem()?.numeroPedido }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="selectedItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="selectedItem() as item">
          <!-- METADATA GRID -->
          <div class="meta-summary-grid">
            <div class="meta-summary-box">
              <span class="meta-label">REACTOR / EQUIPO</span>
              <span class="meta-value">{{ item.reactor }}</span>
              <span class="meta-sub">Capacidad y agitación variable</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">TAMAÑO DEL LOTE</span>
              <span class="meta-value">{{ item.tamanoLoteKg }} Kg / Litros</span>
              <span class="meta-sub">Fecha: {{ item.fecha }}</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">DESPEJE DE LÍNEA</span>
              <span class="meta-value" style="color: #16a34a;">Conforme (7/7)</span>
              <span class="meta-sub">Área sanitizada y balanzas verificadas</span>
            </div>
            <div class="meta-summary-box">
              <span class="meta-label">RESPONSABLES</span>
              <span class="meta-value">{{ item.operador }}</span>
              <span class="meta-sub">Supervisor: {{ item.supervisor }}</span>
            </div>
          </div>

          <!-- TABLA DE FASES REGISTRADAS -->
          <div class="modal-section">
            <h4 class="modal-section-title">Fases y Parámetros de Mezcla Registrados</h4>
            <table class="modal-subtable">
              <thead>
                <tr>
                  <th style="width: 60px;">Fase</th>
                  <th>Procedimiento Detallado</th>
                  <th style="width: 100px;">RPM</th>
                  <th style="width: 100px;">Tiempo</th>
                  <th style="width: 110px;">Temp.</th>
                  <th style="width: 120px;">Operador</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of item.pasos">
                  <td><strong>#{{ p.pasoNumero }}</strong></td>
                  <td>{{ p.procedimiento }}</td>
                  <td><span class="code-tag">{{ p.rpm }}</span></td>
                  <td><strong>{{ p.tiempo }}</strong></td>
                  <td>{{ p.temperatura }}</td>
                  <td>{{ p.realizadoPor }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-section">
            <h4 class="modal-section-title">Observaciones Técnicas de Fin de Proceso</h4>
            <div class="modal-obs-card">
              {{ item.observaciones }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="selectedItem.set(null)">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR FABRICACIÓN -->
    <div class="modal-backdrop" *ngIf="editItem()" (click)="editItem.set(null)">
      <div class="modal-sheet modal-sheet--extra-wide" (click)="$event.stopPropagation()">
        <div class="modal-sheet-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge" style="background: #eff6ff; color: #2563eb;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <div>
              <h3>Editar Orden de Fabricación</h3>
              <p>Formato completo de manufactura y agitación — Lote: {{ editItem()?.lote }}</p>
            </div>
          </div>
          <button class="modal-close-btn" (click)="editItem.set(null)">&times;</button>
        </div>

        <div class="modal-body" *ngIf="editItem() as item">
          <!-- SECCIÓN 1: IDENTIFICACIÓN DEL LOTE Y PRODUCTO -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">1. Identificación del Lote & Orden de Producción</span>
              <span class="modal-fieldset-badge">Fórmula Galénica</span>
            </div>
            <div class="modal-form-grid modal-form-grid--4">
              <div class="modal-field">
                <label class="modal-field-label">Lote de Producto <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.lote" class="modal-field-input" placeholder="LOT-..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Número de Pedido <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.numeroPedido" class="modal-field-input" placeholder="PED-..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Nombre del Producto <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.nombreProducto" class="modal-field-input" placeholder="Ej: Sérum Facial..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Marca o Línea <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.marca" class="modal-field-input" placeholder="Ej: BioTrace Derma..." />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: EQUIPO, CAPACIDAD Y DESPEJE -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">2. Equipo, Tamaño de Lote y Verificación BPM</span>
              <span class="modal-fieldset-badge">Despeje de Línea</span>
            </div>
            <div class="modal-form-grid modal-form-grid--4">
              <div class="modal-field">
                <label class="modal-field-label">Reactor / Marmita <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.reactor" class="modal-field-input" placeholder="Reactor R-101 / Marmita..." />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Tamaño Lote (Kg / L) <span class="req">*</span></label>
                <input type="number" [(ngModel)]="item.tamanoLoteKg" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Fecha de Fabricación <span class="req">*</span></label>
                <input type="date" [(ngModel)]="item.fecha" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Despeje de Línea BPM <span class="req">*</span></label>
                <select [(ngModel)]="item.despejeConforme" class="modal-field-select">
                  <option [ngValue]="true">Conforme (7/7 Ítems)</option>
                  <option [ngValue]="false">No Conforme (Pendiente)</option>
                </select>
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Operador Responsable <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.operador" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Supervisor Técnico <span class="req">*</span></label>
                <input type="text" [(ngModel)]="item.supervisor" class="modal-field-input" />
              </div>
              <div class="modal-field">
                <label class="modal-field-label">Estado de la Orden <span class="req">*</span></label>
                <select [(ngModel)]="item.estado" class="modal-field-select">
                  <option value="Completado">Completado</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: FASES Y PARÁMETROS DE MEZCLA -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">3. Fases del Proceso y Parámetros Operativos</span>
              <button type="button" class="btn-sub-add" (click)="agregarPaso()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Agregar Fase / Paso</span>
              </button>
            </div>

            <div class="modal-table-editable-wrap">
              <table class="modal-table-editable">
                <thead>
                  <tr>
                    <th style="width: 60px;">Paso</th>
                    <th style="min-width: 250px;">Procedimiento Detallado</th>
                    <th style="width: 120px;">RPM</th>
                    <th style="width: 110px;">Tiempo</th>
                    <th style="width: 120px;">Temperatura</th>
                    <th style="width: 130px;">Realizado Por</th>
                    <th style="width: 45px; text-align: center;">Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of item.pasos; let i = index">
                    <td style="font-weight: 800; color: #0891b2; text-align: center;">#{{ p.pasoNumero }}</td>
                    <td>
                      <input type="text" [(ngModel)]="p.procedimiento" class="modal-table-input" placeholder="Descripción de la fase..." />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.rpm" class="modal-table-input" placeholder="Ej: 350 RPM" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.tiempo" class="modal-table-input" placeholder="Ej: 20 min" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.temperatura" class="modal-table-input" placeholder="Ej: 65°C" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.realizadoPor" class="modal-table-input" placeholder="Operador" />
                    </td>
                    <td style="text-align: center;">
                      <button type="button" class="btn-icon-delete-row" (click)="eliminarPaso(i)" title="Eliminar fase" [disabled]="item.pasos.length <= 1">
                        &times;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECCIÓN 4: OBSERVACIONES -->
          <div class="modal-fieldset">
            <div class="modal-fieldset-header">
              <span class="modal-fieldset-title">4. Observaciones Técnicas y Cierre de Lote</span>
            </div>
            <div class="modal-field">
              <textarea [(ngModel)]="item.observaciones" rows="3" class="modal-field-textarea" placeholder="Rendimiento del lote, apariencia organoléptica tras enfriamiento..."></textarea>
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
        <h4>¿Eliminar orden de fabricación?</h4>
        <p>Está a punto de eliminar el registro de manufactura del lote <strong>{{ itemToDelete()?.lote }}</strong> ({{ itemToDelete()?.nombreProducto }}). Esta acción no se puede deshacer.</p>
        <div class="modal-confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
          <button type="button" class="btn btn-danger" (click)="ejecutarEliminar()">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../../../shared/styles/registros-common.css']
})
export class FabricacionRegistrosComponent {
  data = inject(TraceabilityDataService);

  searchTerm = '';
  filtroReactor = 'TODOS';
  filtroFecha = '';

  selectedItem = signal<FabricacionRecord | null>(null);
  editItem = signal<FabricacionRecord | null>(null);
  itemToDelete = signal<FabricacionRecord | null>(null);

  filteredRecords(): FabricacionRecord[] {
    const list = this.data.fabricaciones();
    const term = this.searchTerm.toLowerCase().trim();
    const reactor = this.filtroReactor;
    const fecha = this.filtroFecha;

    return list.filter(r => {
      const matchText = !term ||
        r.lote.toLowerCase().includes(term) ||
        r.numeroPedido.toLowerCase().includes(term) ||
        r.nombreProducto.toLowerCase().includes(term) ||
        r.operador.toLowerCase().includes(term);

      const matchReactor = reactor === 'TODOS' || r.reactor.includes(reactor);
      const matchFecha = !fecha || r.fecha === fecha;

      return matchText && matchReactor && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroReactor = 'TODOS';
    this.filtroFecha = '';
  }

  verDetalle(item: FabricacionRecord) {
    this.selectedItem.set(item);
  }

  editarRegistro(item: FabricacionRecord) {
    this.editItem.set({
      ...item,
      pasos: (item.pasos || []).map(p => ({ ...p }))
    });
  }

  agregarPaso() {
    const item = this.editItem();
    if (item) {
      const nextNum = (item.pasos?.length || 0) + 1;
      item.pasos = [
        ...(item.pasos || []),
        {
          pasoNumero: nextNum,
          procedimiento: '',
          rpm: '300 RPM',
          tiempo: '15 min',
          temperatura: 'Ambiente (22°C)',
          realizadoPor: item.operador || 'Operador Planta'
        }
      ];
      item.totalPasos = item.pasos.length;
    }
  }

  eliminarPaso(index: number) {
    const item = this.editItem();
    if (item && item.pasos && item.pasos.length > 1) {
      item.pasos = item.pasos
        .filter((_, i) => i !== index)
        .map((p, idx) => ({ ...p, pasoNumero: idx + 1 }));
      item.totalPasos = item.pasos.length;
    }
  }

  guardarEdicion() {
    const it = this.editItem();
    if (it) {
      this.data.updateFabricacion(it);
      this.editItem.set(null);
    }
  }

  confirmarEliminar(item: FabricacionRecord) {
    this.itemToDelete.set(item);
  }

  ejecutarEliminar() {
    const it = this.itemToDelete();
    if (it) {
      this.data.deleteFabricacion(it.id);
      this.itemToDelete.set(null);
    }
  }
}
