import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../../../core/services/api.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { InventoryRecord } from '../../../../../core/models/traceability.models';

@Component({
  selector: 'app-mp-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-MP-03</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Materias Primas & Insumos</span>
            </div>
            <h1 class="station-title">Inventario & Stock de Principios Activos</h1>
            <p class="station-desc">Saldos actuales, control de cuarentena por lote, fechas de reanálisis y disponibilidad inmediata.</p>
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

      <div class="records-view-container">
        <section class="records-table-container">
          <div class="table-card-header">
            <h3>Inventario registrado en almacén</h3>
            <span class="badge">{{ inventory.length }} lotes</span>
          </div>
          <table class="records-table">
            <thead>
              <tr>
                <th>Lote Interno</th>
                <th>Materia Prima</th>
                <th>Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of inventory">
                <td><span class="font-mono text-cyan">{{ row.lote_interno }}</span></td>
                <td>{{ row.materia_prima.nombre_insumo }}</td>
                <td><strong>{{ row.stock_disponible }} {{ row.materia_prima.unidad_medida }}</strong></td>
              </tr>
              <tr *ngIf="inventory.length === 0">
                <td colspan="3" class="text-center text-muted">No hay registros de inventario disponibles.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- FORMULARIO DE ALTA RÁPIDA DE MATERIA PRIMA -->
        <section class="lap-card" style="margin-top: 1.5rem;">
          <div class="lap-card__header">
            <div class="lap-card__title-wrap">
              <div class="lap-card__icon-box">+</div>
              <div>
                <h3 class="lap-card__title">Registrar Nueva Materia Prima en Catálogo</h3>
                <p class="lap-card__subtitle">Alta técnica de insumo farmacopéico para recepción y pesada</p>
              </div>
            </div>
          </div>
          <form (ngSubmit)="guardarMateriaPrima()" class="form-grid form-grid--3" style="padding: 1rem 0;">
            <div class="form-field">
              <label class="field-label">Código Insumo <span class="req">*</span></label>
              <input class="field-input font-mono" name="materialCode" placeholder="Ej: MP-AH-001" [(ngModel)]="materialForm.codigo_materia_prima" required />
            </div>
            <div class="form-field">
              <label class="field-label">Nombre del Principio Activo <span class="req">*</span></label>
              <input class="field-input" name="materialName" placeholder="Ej: Ácido Hialurónico Puro" [(ngModel)]="materialForm.nombre_insumo" required />
            </div>
            <div class="form-field">
              <label class="field-label">Unidad de Medida <span class="req">*</span></label>
              <input class="field-input" name="materialUnit" placeholder="kg, g, L" [(ngModel)]="materialForm.unidad_medida" required />
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <button class="btn btn-primary" [disabled]="readOnly()">Guardar materia prima</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `
})
export class MpInventarioComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  feedbackMessage = signal<string | null>(null);
  readOnly = signal<boolean>(false);
  inventory: InventoryRecord[] = [];
  materialForm = { codigo_materia_prima: '', nombre_insumo: '', unidad_medida: 'kg' };

  async ngOnInit() {
    await this.reload();
  }

  async reload() {
    try {
      const health = await firstValueFrom(this.api.getHealth());
      this.readOnly.set(health.readOnly);
      this.inventory = await firstValueFrom(this.api.list<InventoryRecord>('inventory'));
    } catch (err) {
      this.feedbackMessage.set(err instanceof HttpErrorResponse ? err.error?.error || 'Error' : 'Error al cargar');
    }
  }

  async guardarMateriaPrima() {
    try {
      await firstValueFrom(this.api.create('materials', this.materialForm));
      this.materialForm = { codigo_materia_prima: '', nombre_insumo: '', unidad_medida: 'kg' };
      this.feedbackMessage.set('Materia prima guardada exitosamente.');
      await this.reload();
    } catch (err) {
      this.feedbackMessage.set(err instanceof HttpErrorResponse ? err.error?.error || 'Error' : 'Error al guardar');
    }
  }
}
