import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { TraceabilityDataService, FabricacionRecord } from '../../../../../core/services/traceability-data.service';

interface PasoFabricacion {
  pasoNumero: number;
  procedimiento: string;
  rpm: string;
  tiempo: string;
  temperatura: string;
  realizadoPor: string;
}

interface PreguntaDespeje {
  id: number;
  texto: string;
  valor: boolean;
}

@Component({
  selector: 'app-fabricacion-formato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- HEADER CON ACCESO A REGISTROS -->
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
              <span class="station-code-badge">EST-FAB-01</span>
              <span class="station-domain-badge">Dermo-Pharma GMP</span>
              <span class="station-cat-badge">Manufactura & Reactores</span>
            </div>
            <h1 class="station-title">Fabricación del Producto — Llenar Formato</h1>
            <p class="station-desc">
              Registro de manufactura: despeje de línea 7/7, control de variables (RPM, tiempo, temperatura) y firmas técnicas.
            </p>
          </div>
        </div>

        <div class="station-header-actions">
          <a routerLink="/trazabilidad/estaciones/fabricacion/registros" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver registros de fabricación</span>
          </a>
        </div>
      </header>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMessage()" class="alert-box alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Registro de fabricación guardado exitosamente!</strong>
          <p>La orden y sus parámetros técnicos han sido archivados en el libro de planta.</p>
        </div>
      </div>

      <!-- FORMULARIO DE FABRICACIÓN -->
      <form (ngSubmit)="guardarFabricacion()" class="form-flow">
        
        <!-- SECCIÓN 1: DESPEJE DE LÍNEA (7 PREGUNTAS BPM) -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--emerald">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div>
              <h3>1. Verificación de Despeje de Línea (BPM / GMP)</h3>
              <p>Requisito obligatorio previo al encendido del reactor y adición de materias primas</p>
            </div>
          </div>

          <div class="checklist-grid">
            <div *ngFor="let item of preguntasDespeje" class="checklist-item">
              <span class="checklist-text">{{ item.id }}. {{ item.texto }}</span>
              <div class="toggle-group">
                <button
                  type="button"
                  class="toggle-btn"
                  [class.toggle-btn--active]="item.valor"
                  (click)="item.valor = true"
                >
                  Conforme (Sí)
                </button>
                <button
                  type="button"
                  class="toggle-btn toggle-btn--no"
                  [class.toggle-btn--active]="!item.valor"
                  (click)="item.valor = false"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: DATOS DEL LOTE Y ORDEN -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3>2. Identificación del Lote & Orden de Producción</h3>
              <p>Especificaciones galénicas de la mezcla cosmética</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Vincular Orden de Pedido Comercial</label>
              <select [(ngModel)]="formData.numeroPedido" name="numeroPedido" (change)="onPedidoChange()" class="form-select font-bold">
                <option value="">-- Sin vincular / Entrada Manual --</option>
                <option *ngFor="let ped of data.pedidos()" [value]="ped.numeroPedido">
                  {{ ped.numeroPedido }} • {{ ped.clienteNombre }} ({{ ped.productoNombre }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Número de Lote de Producto <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.lote" name="lote" required placeholder="Ej: LOT-GAL-2026-088" class="form-input font-mono font-bold" />
            </div>

            <div class="form-group">
              <label>Nombre del Producto <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.nombreProducto" name="nombreProducto" required placeholder="Ej: Sérum Facial Ácido Hialurónico 2%" class="form-input font-bold" />
            </div>

            <div class="form-group">
              <label>Marca o Línea <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.marca" name="marca" required placeholder="Ej: BioTrace Derma" class="form-input" />
            </div>

            <div class="form-group">
              <label>Reactor / Marmita <span class="req-star">*</span></label>
              <select [(ngModel)]="formData.reactor" name="reactor" class="form-select" required>
                <option value="Reactor R-101 (Inox 500L)">Reactor R-101 (Inox 500L)</option>
                <option value="Reactor R-102 (Inox 250L)">Reactor R-102 (Inox 250L)</option>
                <option value="Marmita Calefactora M-01 (100L)">Marmita Calefactora M-01 (100L)</option>
                <option value="Homogenizador Turbo-200">Homogenizador Turbo-200</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tamaño del Lote (Kg / L) <span class="req-star">*</span></label>
              <input type="number" [(ngModel)]="formData.tamanoLote" name="tamanoLote" required placeholder="250" class="form-input font-bold" style="color: #0891b2;" />
            </div>

            <div class="form-group">
              <label>Fecha de Fabricación <span class="req-star">*</span></label>
              <input type="date" [(ngModel)]="formData.fecha" name="fecha" required class="form-input" />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: FASES Y PASOS DE FABRICACIÓN -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="card-title-grow">
              <h3>3. Fases y Procedimiento de Mezcla</h3>
              <p>Variables críticas de control registradas por el operador en tiempo real</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="agregarPaso()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Agregar Paso</span>
            </button>
          </div>

          <div class="pasos-table-wrap">
            <table class="pasos-table">
              <thead>
                <tr>
                  <th style="width: 60px; text-align: center;">Paso</th>
                  <th style="min-width: 280px;">Procedimiento Detallado *</th>
                  <th style="min-width: 130px; text-align: center;">RPM Agitación</th>
                  <th style="min-width: 120px; text-align: center;">Tiempo</th>
                  <th style="min-width: 130px; text-align: center;">Temperatura</th>
                  <th style="min-width: 160px;">Realizado Por</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of pasos; let i = index">
                  <td class="text-center font-bold" style="color: #0891b2; font-size: 0.95rem;">#{{ p.pasoNumero }}</td>
                  <td>
                    <textarea
                      [(ngModel)]="p.procedimiento"
                      [name]="'proc_' + i"
                      rows="2"
                      class="step-textarea"
                      placeholder="Descripción de la adición de ingredientes o agitación..."
                      required
                    ></textarea>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.rpm" [name]="'rpm_' + i" placeholder="400 RPM" class="step-input text-center" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.tiempo" [name]="'tiempo_' + i" placeholder="20 min" class="step-input text-center" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.temperatura" [name]="'temp_' + i" placeholder="Ambiente / 65°C" class="step-input text-center" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.realizadoPor" [name]="'operador_' + i" placeholder="Operario de turno" class="step-input" />
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      *ngIf="pasos.length > 1"
                      class="btn-delete-row"
                      (click)="eliminarPaso(i)"
                      title="Eliminar este paso"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN 4: RESPONSABLES Y FIRMA -->
        <div class="card form-card">
          <div class="card-header">
            <div class="card-header-icon icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3>4. Aprobación y Observaciones Técnicas</h3>
              <p>Firmas y validación de fin de etapa de fabricación</p>
            </div>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label>Operador Responsable de Fabricación <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.operadorResponsable" name="operadorResponsable" required class="form-input font-bold" />
            </div>

            <div class="form-group">
              <label>Supervisor de Planta <span class="req-star">*</span></label>
              <input type="text" [(ngModel)]="formData.supervisor" name="supervisor" placeholder="Ing. Químico de Turno" class="form-input font-bold" required />
            </div>

            <div class="form-group full-width">
              <label>Observaciones del Proceso</label>
              <textarea
                [(ngModel)]="formData.observaciones"
                name="observaciones"
                rows="3"
                placeholder="Indicar cualquier novedad en agitación, enfriamiento o control de emulsión..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- ACCIONES FINALES -->
        <div class="form-submit-bar">
          <a routerLink="/trazabilidad/estaciones/fabricacion/registros" class="btn btn-secondary">
            Cancelar
          </a>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
            <svg *ngIf="!isSaving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isSaving() ? 'Guardando en el sistema...' : 'Guardar Registro de Fabricación' }}</span>
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
    .card-title-grow {
      flex: 1;
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
    .icon--emerald { background: #f0fdf4; color: #16a34a; }
    .icon--cyan { background: #ecfeff; color: #0891b2; }
    .icon--purple { background: #faf5ff; color: #9333ea; }
    .icon--amber { background: #fffbeb; color: #d97706; }

    /* CHECKLIST GRID */
    .checklist-grid {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }
    .checklist-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1e293b;
    }
    .toggle-group {
      display: inline-flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    .toggle-btn {
      padding: 5px 12px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      background: #ffffff;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .toggle-btn--active {
      background: #16a34a;
      color: #ffffff;
    }
    .toggle-btn--no.toggle-btn--active {
      background: #dc2626;
      color: #ffffff;
    }

    /* INPUTS GRID */
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

    /* TABLA DE PASOS */
    .pasos-table-wrap {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      overflow-x: auto;
    }
    .pasos-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .pasos-table th {
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
    .pasos-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .step-textarea {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
      resize: vertical;
    }
    .step-input {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
    }
    .step-textarea:focus, .step-input:focus {
      border-color: #9333ea;
      box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.15);
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
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
  `]
})
export class FabricacionFormatoComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(TraceabilityDataService);
  private router = inject(Router);

  isSaving = signal(false);
  successMessage = signal(false);

  preguntasDespeje: PreguntaDespeje[] = [
    { id: 1, texto: '¿El área de reactor y marmitas está limpia y sanitizada?', valor: true },
    { id: 2, texto: '¿Los tanques, palas y agitadores se encuentran sin residuos del lote anterior?', valor: true },
    { id: 3, texto: '¿Ausencia de materias primas o tambores ajenos a esta orden de producción?', valor: true },
    { id: 4, texto: '¿Las balanzas e instrumentos de control cuentan con calibración vigente?', valor: true },
    { id: 5, texto: '¿El reactor está debidamente rotulado con la ficha de la orden a iniciar?', valor: true },
    { id: 6, texto: '¿El personal cuenta con bata estéril, cofia, tapabocas y guantes de nitrilo?', valor: true },
    { id: 7, texto: '¿Se autoriza formalmente el inicio del proceso de mezclado?', valor: true }
  ];

  formData = {
    numeroPedido: '',
    lote: '',
    nombreProducto: '',
    marca: 'BioTrace',
    reactor: 'Reactor R-101 (Inox 500L)',
    tamanoLote: 0,
    fecha: new Date().toISOString().split('T')[0],
    operadorResponsable: this.auth.currentUser()?.name || '',
    supervisor: '',
    observaciones: ''
  };

  pasos: PasoFabricacion[] = [
    {
      pasoNumero: 1,
      procedimiento: 'Carga de vehículo principal e inicio de agitación controlada.',
      rpm: '350 RPM',
      tiempo: '15 min',
      temperatura: '22°C',
      realizadoPor: this.auth.currentUser()?.name || 'Operador de Planta'
    }
  ];

  ngOnInit() {
    const peds = this.data.pedidos();
    if (peds.length > 0) {
      this.formData.numeroPedido = peds[0].numeroPedido;
      this.onPedidoChange();
    }
  }

  onPedidoChange() {
    if (!this.formData.numeroPedido) return;
    const ped = this.data.pedidos().find(p => p.numeroPedido === this.formData.numeroPedido);
    if (ped) {
      this.formData.lote = ped.loteAsignado;
      this.formData.nombreProducto = ped.productoNombre;
      this.formData.tamanoLote = ped.tamanoLoteKg;
    }
  }

  agregarPaso() {
    const nextNum = this.pasos.length + 1;
    this.pasos.push({
      pasoNumero: nextNum,
      procedimiento: '',
      rpm: '500 RPM',
      tiempo: '15 min',
      temperatura: 'Ambiente',
      realizadoPor: this.formData.operadorResponsable
    });
  }

  eliminarPaso(index: number) {
    this.pasos.splice(index, 1);
    this.pasos.forEach((p, idx) => p.pasoNumero = idx + 1);
  }

  guardarFabricacion() {
    this.isSaving.set(true);

    const nuevoFab: FabricacionRecord = {
      id: `FAB-${Date.now().toString().slice(-4)}`,
      lote: this.formData.lote,
      numeroPedido: this.formData.numeroPedido || 'PED-MANUAL',
      nombreProducto: this.formData.nombreProducto,
      marca: this.formData.marca,
      reactor: this.formData.reactor,
      tamanoLoteKg: this.formData.tamanoLote,
      fecha: this.formData.fecha,
      despejeConforme: this.preguntasDespeje.every(p => p.valor),
      totalPasos: this.pasos.length,
      operador: this.formData.operadorResponsable,
      supervisor: this.formData.supervisor,
      estado: 'Completado',
      pasos: this.pasos.map(p => ({ ...p })),
      observaciones: this.formData.observaciones
    };

    setTimeout(() => {
      this.data.addFabricacion(nuevoFab);
      this.isSaving.set(false);
      this.successMessage.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('/trazabilidad/estaciones/fabricacion/registros');
      }, 1400);
    }, 700);
  }
}
