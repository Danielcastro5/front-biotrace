import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TraceabilityDataService, ProductoRecord, FormulaItem } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-productos-formato',
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
              <span class="station-code-badge">EST-PROD-01</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Catálogo & Fórmulas Magistrales</span>
            </div>
            <h1 class="station-title">Registrar Producto & Fórmula Galénica</h1>
            <p class="station-desc">Definición de especificaciones cosméticas, registro sanitario y desglose de materias primas por lote maestro.</p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/comercial/productos/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver catálogo de productos</span>
          </a>
        </div>
      </header>

      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Producto y fórmula guardados exitosamente!</strong>
          <p>La fórmula queda disponible para programar consumos y órdenes de pedido.</p>
        </div>
      </div>

      <form (ngSubmit)="guardarProducto()" class="form-flow">
        <!-- 1. ESPECIFICACIONES DEL PRODUCTO -->
        <div class="form-card-box">
          <div class="form-card-box__header">
            <div class="form-card-box__num">1</div>
            <div>
              <h3 class="form-card-box__title">Especificaciones del Producto Galénico</h3>
              <p class="form-card-box__subtitle">Datos técnicos requeridos para notificación Invima y ficha de manufactura</p>
            </div>
          </div>

          <div class="form-inputs-grid form-inputs-grid--3">
            <div class="form-field-group">
              <label class="form-field-label">Nombre Comercial del Producto <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="producto.nombre"
                name="nombre"
                required
                placeholder="Ej: Gel Contorno de Ojos Cafeína 5%"
                class="form-field-control font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Código Único Galénico <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="producto.codigo"
                name="codigo"
                required
                placeholder="Ej: PRD-GEL-04"
                class="form-field-control font-mono font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Línea / Marca <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="producto.linea"
                name="linea"
                required
                placeholder="BioTrace Derma Care"
                class="form-field-control"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Presentación Comercial <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="producto.presentacion"
                name="presentacion"
                required
                placeholder="Tubo colapsible airless x 15 ml"
                class="form-field-control"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Notificación Sanitaria Invima <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="producto.registroInvima"
                name="registroInvima"
                required
                placeholder="NSOC65214-25CO"
                class="form-field-control font-mono"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Tamaño de Lote Estándar (Kg) <span class="req-star">*</span></label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                [(ngModel)]="producto.tamanoLoteEstandar"
                (ngModelChange)="recalcularCantidades()"
                name="tamanoLoteEstandar"
                required
                placeholder="100"
                class="form-field-control font-bold"
                style="color: #0891b2;"
              />
            </div>
          </div>
        </div>

        <!-- 2. FÓRMULA MAGISTRAL DINÁMICA -->
        <div class="form-card-box table-card-box">
          <div class="table-card-box__header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="form-card-box__num">2</span>
                <h3 class="form-card-box__title" style="margin: 0;">Fórmula Galénica Estándar</h3>
              </div>
              <p class="form-card-box__subtitle" style="margin-top: 4px;">
                Materias primas, lotes sugeridos y porcentajes por lote de producción (Base: {{ producto.tamanoLoteEstandar }} Kg)
              </p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="agregarIngrediente()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Agregar Materia Prima</span>
            </button>
          </div>

          <div class="table-responsive-box">
            <table class="consumption-table">
              <thead>
                <tr>
                  <th style="min-width: 240px;">Componente / Materia Prima *</th>
                  <th style="min-width: 250px;">Lote MP Sugerido / Código</th>
                  <th style="width: 140px; text-align: right;">% en Fórmula</th>
                  <th style="width: 160px; text-align: right;">Cantidad por Lote</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of formula; let i = index">
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="item.nombreMateriaPrima"
                      [name]="'mp_' + i"
                      placeholder="Ej: Cafeína Pura USP"
                      class="table-row-input font-bold"
                      required
                    />
                  </td>
                  <td>
                    <select [(ngModel)]="item.loteSugerido" [name]="'lote_' + i" class="table-row-select font-mono">
                      <option *ngIf="item.loteSugerido && !isLotInIngresos(item.loteSugerido)" [value]="item.loteSugerido">
                        {{ item.loteSugerido }} (Asignado)
                      </option>
                      <option *ngFor="let ing of data.ingresosMp()" [value]="ing.loteInterno">
                        {{ ing.loteInterno }} — {{ ing.producto }}
                      </option>
                    </select>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        [(ngModel)]="item.porcentaje"
                        (ngModelChange)="onPorcentajeChange(item)"
                        [name]="'pct_' + i"
                        class="table-row-input table-row-input--num text-right"
                        style="width: 85px;"
                        required
                      />
                      <span class="unit-text font-bold">%</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [(ngModel)]="item.cantidadPorLote"
                        [name]="'kg_' + i"
                        class="table-row-input table-row-input--num table-row-input--highlight text-right"
                        style="width: 95px;"
                        required
                      />
                      <span class="unit-text font-bold" style="color: #0891b2;">Kg</span>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      *ngIf="formula.length > 1"
                      (click)="eliminarIngrediente(i)"
                      class="btn-row-del"
                      title="Eliminar ingrediente"
                    >
                      &times;
                    </button>
                  </td>
                </tr>

                <tr *ngIf="formula.length === 0">
                  <td colspan="5" style="text-align: center; padding: 2.5rem; color: #64748b;">
                    <p style="margin: 0 0 0.75rem 0;">No hay materias primas registradas en la fórmula.</p>
                    <button type="button" class="btn btn-secondary btn-sm" (click)="agregarIngrediente()">
                      + Agregar Materia Prima
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RESUMEN DE PORCENTAJES -->
          <div class="mass-balance-bar">
            <div class="mass-balance-item">
              <span class="mass-label">SUMA DE PORCENTAJES:</span>
              <span
                class="mass-val"
                [style.color]="Math.abs(totalPorcentaje() - 100) < 0.01 ? '#16a34a' : '#dc2626'"
              >
                {{ totalPorcentaje().toFixed(2) }} %
                {{ Math.abs(totalPorcentaje() - 100) < 0.01 ? '(100% Completo)' : '(Desbalance)' }}
              </span>
            </div>
            <div class="mass-balance-item">
              <span class="mass-label">TOTAL PESO FÓRMULA:</span>
              <span class="mass-val mass-val--cyan">{{ totalKilos().toFixed(2) }} Kg</span>
            </div>
          </div>
        </div>

        <!-- ACCIONES FINALES -->
        <div class="form-action-bar">
          <a routerLink="/trazabilidad/comercial/productos/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving() || formula.length === 0">
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Guardando fórmula...' : 'Guardar Producto & Fórmula' }}</span>
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
    .table-card-box {
      padding: 0;
      overflow: hidden;
    }
    .table-card-box__header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      background: #fcfdfe;
    }
    .table-responsive-box {
      width: 100%;
      overflow-x: auto;
    }
    .consumption-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .consumption-table th {
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
    .consumption-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .table-row-input, .table-row-select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
    }
    .table-row-input:focus, .table-row-select:focus {
      border-color: #0891b2;
      box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15);
    }
    .table-row-input--num {
      font-family: monospace;
      font-size: 0.875rem;
    }
    .table-row-input--highlight {
      background: #ecfeff;
      border-color: #0891b2;
      font-weight: 800;
      color: #0891b2;
    }
    .unit-text {
      font-size: 0.78rem;
      color: #64748b;
    }
    .text-right {
      text-align: right;
    }
    .btn-row-del {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .btn-row-del:hover {
      background: #fee2e2;
    }
    .mass-balance-bar {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .mass-balance-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mass-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
    }
    .mass-val {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }
    .mass-val--cyan {
      color: #0891b2;
    }
    .form-action-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 0.5rem;
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
export class ProductosFormatoComponent {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);
  Math = Math;

  producto: ProductoRecord = {
    id: '',
    codigo: `PRD-${Math.floor(100 + Math.random() * 900)}`,
    nombre: '',
    linea: 'BioTrace Derma Care',
    presentacion: '',
    registroInvima: 'NSOC' + Math.floor(10000 + Math.random() * 90000) + '-26CO',
    tamanoLoteEstandar: 100,
    formula: [],
    estado: 'Activo'
  };

  formula: FormulaItem[] = [];

  isLotInIngresos(lote: string): boolean {
    return this.data.ingresosMp().some(ing => ing.loteInterno === lote);
  }

  onPorcentajeChange(item: FormulaItem) {
    const base = Number(this.producto.tamanoLoteEstandar) || 100;
    item.cantidadPorLote = Number(((base * (Number(item.porcentaje) || 0)) / 100).toFixed(2));
  }

  recalcularCantidades() {
    const base = Number(this.producto.tamanoLoteEstandar) || 100;
    this.formula.forEach(item => {
      item.cantidadPorLote = Number(((base * (Number(item.porcentaje) || 0)) / 100).toFixed(2));
    });
  }

  agregarIngrediente() {
    const availableLote = this.data.ingresosMp().length > 0 ? this.data.ingresosMp()[0].loteInterno : '';
    this.formula.push({
      codigoMateriaPrima: `MP-${this.formula.length + 1}`,
      nombreMateriaPrima: '',
      loteSugerido: availableLote,
      porcentaje: 0,
      cantidadPorLote: 0,
      unidad: 'Kg'
    });
  }

  eliminarIngrediente(index: number) {
    this.formula.splice(index, 1);
  }

  totalPorcentaje(): number {
    return this.formula.reduce((acc, curr) => acc + (Number(curr.porcentaje) || 0), 0);
  }

  totalKilos(): number {
    return this.formula.reduce((acc, curr) => acc + (Number(curr.cantidadPorLote) || 0), 0);
  }

  guardarProducto() {
    this.isSaving.set(true);
    this.producto.id = `PRD-${Date.now().toString().slice(-4)}`;
    this.producto.formula = this.formula.map(f => ({ ...f }));

    setTimeout(() => {
      this.data.addProducto({ ...this.producto });
      this.isSaving.set(false);
      this.successMsg.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/comercial/productos/registros');
      }, 1400);
    }, 600);
  }
}
