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
              <span class="station-cat-badge">Catálogo & Fórmulas Magistrales</span>
            </div>
            <h1 class="station-title">Registrar Producto & Fórmula Galénica</h1>
            <p class="station-desc">Definición de especificaciones cosméticas, registro sanitario y desglose de materias primas.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/productos/registros" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Ver catálogo de productos</span>
        </a>
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

      <form (ngSubmit)="guardarProducto()" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- DATOS DEL PRODUCTO -->
        <div class="filter-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem 0;">1. Especificaciones del Producto</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.15rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Nombre Comercial del Producto *</label>
              <input type="text" [(ngModel)]="producto.nombre" name="nombre" required placeholder="Ej: Gel Contorno de Ojos Cafeína 5%" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Código Único Galénico *</label>
              <input type="text" [(ngModel)]="producto.codigo" name="codigo" required placeholder="Ej: PRD-GEL-04" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Línea / Marca *</label>
              <input type="text" [(ngModel)]="producto.linea" name="linea" required placeholder="BioTrace Derma Care" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Presentación Comercial *</label>
              <input type="text" [(ngModel)]="producto.presentacion" name="presentacion" required placeholder="Tubo colapsible airless x 15 ml" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Notificación Sanitaria Invima *</label>
              <input type="text" [(ngModel)]="producto.registroInvima" name="registroInvima" required placeholder="NSOC65214-25CO" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>

            <div>
              <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Tamaño de Lote Estándar (Kg) *</label>
              <input type="number" [(ngModel)]="producto.tamanoLoteEstandar" name="tamanoLoteEstandar" required placeholder="100" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
            </div>
          </div>
        </div>

        <!-- FÓRMULA MAGISTRAL DINÁMICA -->
        <div class="table-card">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">2. Fórmula Galénica Estándar</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Materias primas y porcentajes por lote de producción</p>
            </div>
            <button type="button" class="btn btn-secondary" (click)="agregarIngrediente()">
              + Agregar Materia Prima
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Componente / Materia Prima</th>
                  <th>Lote MP Sugerido</th>
                  <th style="width: 130px; text-align: right;">% en Fórmula</th>
                  <th style="width: 150px; text-align: right;">Cantidad por Lote</th>
                  <th style="width: 60px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of formula; let i = index">
                  <td>
                    <input type="text" [(ngModel)]="item.nombreMateriaPrima" [name]="'mp_' + i" placeholder="Ej: Cafeína Pura USP" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.45rem; border-radius: 6px;" />
                  </td>
                  <td>
                    <select [(ngModel)]="item.loteSugerido" [name]="'lote_' + i" class="filter-select">
                      <option *ngFor="let ing of data.ingresosMp()" [value]="ing.loteInterno">{{ ing.loteInterno }} ({{ ing.producto.slice(0, 20) }})</option>
                    </select>
                  </td>
                  <td style="text-align: right;">
                    <input type="number" step="0.1" [(ngModel)]="item.porcentaje" [name]="'pct_' + i" class="filter-input" style="width: 80px; text-align: right; border: 1px solid #cbd5e1; padding: 0.45rem; border-radius: 6px;" /> %
                  </td>
                  <td style="text-align: right;">
                    <input type="number" step="0.1" [(ngModel)]="item.cantidadPorLote" [name]="'kg_' + i" class="filter-input" style="width: 90px; text-align: right; border: 1px solid #cbd5e1; padding: 0.45rem; border-radius: 6px;" /> Kg
                  </td>
                  <td style="text-align: center;">
                    <button type="button" *ngIf="formula.length > 1" (click)="eliminarIngrediente(i)" style="background: none; border: none; color: #dc2626; font-size: 1.2rem; cursor: pointer;">&times;</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <a routerLink="/trazabilidad/comercial/productos/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            {{ isSaving() ? 'Guardando fórmula...' : 'Guardar Producto & Fórmula' }}
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
export class ProductosFormatoComponent {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);

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

  formula: FormulaItem[] = [
    { codigoMateriaPrima: 'MP-01', nombreMateriaPrima: 'Principio Activo Principal', loteSugerido: 'LOT-MP-HA-101', porcentaje: 5.0, cantidadPorLote: 5.0, unidad: 'Kg' },
    { codigoMateriaPrima: 'MP-02', nombreMateriaPrima: 'Agua Desionizada Purificada Grado USP', loteSugerido: 'LOT-MP-AG-205', porcentaje: 95.0, cantidadPorLote: 95.0, unidad: 'Kg' }
  ];

  agregarIngrediente() {
    this.formula.push({
      codigoMateriaPrima: `MP-${this.formula.length + 1}`,
      nombreMateriaPrima: '',
      loteSugerido: 'LOT-MP-AG-205',
      porcentaje: 0,
      cantidadPorLote: 0,
      unidad: 'Kg'
    });
  }

  eliminarIngrediente(index: number) {
    this.formula.splice(index, 1);
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
