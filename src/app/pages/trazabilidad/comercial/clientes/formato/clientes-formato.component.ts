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
              <span class="station-domain-badge">Dermo-Pharma CRM</span>
              <span class="station-cat-badge">Módulo Comercial & Clientes</span>
            </div>
            <h1 class="station-title">Registrar Nuevo Cliente</h1>
            <p class="station-desc">Alta y homologación de cuentas comerciales, contactos corporativos y puntos de despacho autorizados.</p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/comercial/clientes/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver directorio de clientes</span>
          </a>
        </div>
      </header>

      <div *ngIf="successMsg()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Cliente registrado exitosamente!</strong>
          <p>La cuenta ha sido habilitada para crear órdenes de pedido y despachos comerciales.</p>
        </div>
      </div>

      <form (ngSubmit)="guardarCliente()" class="form-flow">
        <div class="form-card-box">
          <div class="form-card-box__header">
            <div class="form-card-box__num">1</div>
            <div>
              <h3 class="form-card-box__title">Datos de la Empresa / Razón Social</h3>
              <p class="form-card-box__subtitle">Información fiscal, contactos comerciales y categorización</p>
            </div>
          </div>

          <div class="form-inputs-grid form-inputs-grid--3">
            <div class="form-field-group">
              <label class="form-field-label">Razón Social Corporativa <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.razonSocial"
                name="razonSocial"
                required
                placeholder="Ej: Laboratorios Dermacare S.A.S."
                class="form-field-control font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">NIT / Identificación Tributaria <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.nit"
                name="nit"
                required
                placeholder="Ej: 900.874.221-5"
                class="form-field-control font-mono font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Persona de Contacto / Compras <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.contacto"
                name="contacto"
                required
                placeholder="Ej: Lic. Viviana Silva"
                class="form-field-control font-bold"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Correo Electrónico de Pedidos <span class="req-star">*</span></label>
              <input
                type="email"
                [(ngModel)]="cliente.correo"
                name="correo"
                required
                placeholder="compras@cliente.com"
                class="form-field-control"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Teléfono / PBX <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.telefono"
                name="telefono"
                required
                placeholder="+57 (4) 321-4455"
                class="form-field-control font-mono"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Ciudad / Departamento <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.ciudad"
                name="ciudad"
                required
                placeholder="Medellín, Antioquia"
                class="form-field-control"
              />
            </div>

            <div class="form-field-group full-width-span">
              <label class="form-field-label">Dirección Principal de Despacho <span class="req-star">*</span></label>
              <input
                type="text"
                [(ngModel)]="cliente.direccion"
                name="direccion"
                required
                placeholder="Carrera 48 # 20 - 110, Zona Industrial"
                class="form-field-control"
              />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Categoría Comercial de Cliente</label>
              <select [(ngModel)]="cliente.categoria" name="categoria" class="form-field-control font-bold">
                <option value="Cliente Magistral VIP">Cliente Magistral VIP</option>
                <option value="Distribuidor Nacional">Distribuidor Nacional</option>
                <option value="Cadena de Clínicas">Cadena de Clínicas</option>
                <option value="Cadena de Farmacias">Cadena de Farmacias</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-action-bar">
          <a routerLink="/trazabilidad/comercial/clientes/registros" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Guardando cliente...' : 'Guardar Cliente' }}</span>
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
    .full-width-span {
      grid-column: 1 / -1;
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
    .form-action-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
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
