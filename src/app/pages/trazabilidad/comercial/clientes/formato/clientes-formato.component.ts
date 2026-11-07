import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TraceabilityDataService, ClienteRecord } from '../../../../../core/services/traceability-data.service';

@Component({
  selector: 'app-clientes-formato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="station-header">
        <div class="station-header-main">
          <div class="station-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="station-header-text">
            <div class="station-tag-row">
              <span class="station-code-badge">EST-CLI-01</span>
              <span class="station-cat-badge">Módulo Comercial & Clientes</span>
            </div>
            <h1 class="station-title">Registrar Nuevo Cliente</h1>
            <p class="station-desc">Alta y homologación de cuentas comerciales, contactos y puntos de despacho.</p>
          </div>
        </div>

        <a routerLink="/trazabilidad/comercial/clientes/registros" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Ver directorio de clientes</span>
        </a>
      </header>

      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Cliente registrado exitosamente!</strong>
          <p>La cuenta ha sido habilitada para crear órdenes de pedido.</p>
        </div>
      </div>

      <form (ngSubmit)="guardarCliente()" class="filter-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0;">Datos de la Empresa / Cliente</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.15rem;">
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Razón Social *</label>
            <input type="text" [(ngModel)]="cliente.razonSocial" name="razonSocial" required placeholder="Ej: Laboratorios Dermacare S.A.S." class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">NIT / Identificación Tributaria *</label>
            <input type="text" [(ngModel)]="cliente.nit" name="nit" required placeholder="Ej: 900.874.221-5" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Persona de Contacto *</label>
            <input type="text" [(ngModel)]="cliente.contacto" name="contacto" required placeholder="Ej: Lic. Viviana Silva" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Correo Electrónico *</label>
            <input type="email" [(ngModel)]="cliente.correo" name="correo" required placeholder="compras@cliente.com" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Teléfono / PBX *</label>
            <input type="text" [(ngModel)]="cliente.telefono" name="telefono" required placeholder="+57 (4) 321-4455" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Ciudad / Departamento *</label>
            <input type="text" [(ngModel)]="cliente.ciudad" name="ciudad" required placeholder="Medellín, Antioquia" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div style="grid-column: 1 / -1;">
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Dirección de Despacho *</label>
            <input type="text" [(ngModel)]="cliente.direccion" name="direccion" required placeholder="Carrera 48 # 20 - 110, Zona Industrial" class="filter-input" style="border: 1px solid #cbd5e1; padding: 0.65rem; border-radius: 8px; margin-top: 4px;" />
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155;">Categoría de Cliente</label>
            <select [(ngModel)]="cliente.categoria" name="categoria" class="filter-select" style="width: 100%; margin-top: 4px; padding: 0.65rem;">
              <option value="Cliente Magistral VIP">Cliente Magistral VIP</option>
              <option value="Distribuidor Nacional">Distribuidor Nacional</option>
              <option value="Cadena de Clínicas">Cadena de Clínicas</option>
              <option value="Cadena de Farmacias">Cadena de Farmacias</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
          <a routerLink="/trazabilidad/comercial/clientes/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            {{ isSaving() ? 'Guardando cliente...' : 'Guardar Cliente' }}
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
export class ClientesFormatoComponent {
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMsg = signal(false);

  cliente: ClienteRecord = {
    id: '',
    codigo: `CLI-2026-${Math.floor(100 + Math.random() * 900)}`,
    razonSocial: '',
    nit: '',
    contacto: '',
    correo: '',
    telefono: '',
    ciudad: 'Medellín, Antioquia',
    direccion: '',
    categoria: 'Cliente Magistral VIP',
    estado: 'Activo'
  };

  guardarCliente() {
    this.isSaving.set(true);
    this.cliente.id = `CLI-${Date.now().toString().slice(-4)}`;

    setTimeout(() => {
      this.data.addCliente({ ...this.cliente });
      this.isSaving.set(false);
      this.successMsg.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/comercial/clientes/registros');
      }, 1400);
    }, 600);
  }
}
