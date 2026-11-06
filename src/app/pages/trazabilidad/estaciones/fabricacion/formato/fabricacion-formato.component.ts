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
      <div class="page-header">
        <div class="header-left">
          <div class="header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>ESTACIÓN DE FABRICACIÓN • GMP/BPM</span>
          </div>
          <h1 class="header-title">Fabricación del Producto</h1>
          <p class="header-desc">
            Llenado de registro de manufactura: despeje de línea, control de variables (RPM, tiempo, temperatura) y firmas técnicas.
          </p>
        </div>

        <div class="header-right">
          <a routerLink="/trazabilidad/estaciones/fabricacion/registros" class="btn btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ver registros de fabricación</span>
          </a>
        </div>
      </div>

      <!-- ALERTA DE ÉXITO -->
      <div *ngIf="successMessage()" class="alert alert--success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <strong>¡Registro de fabricación guardado exitosamente!</strong>
          <p>La orden y sus parámetros técnicos han sido archivados en el libro de planta.</p>
        </div>
      </div>

      <!-- FORMULARIO DE FABRICACIÓN -->
      <form (ngSubmit)="guardarFabricacion()" class="form-layout">
        
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
              <label>Número de Lote de Producto *</label>
              <input type="text" [(ngModel)]="formData.lote" name="lote" required placeholder="Ej: LOT-GAL-2026-088" class="form-input" />
            </div>

            <div class="form-group">
              <label>Nombre del Producto *</label>
              <input type="text" [(ngModel)]="formData.nombreProducto" name="nombreProducto" required placeholder="Ej: Sérum Facial Ácido Hialurónico 2%" class="form-input" />
            </div>

            <div class="form-group">
              <label>Marca o Línea *</label>
              <input type="text" [(ngModel)]="formData.marca" name="marca" required placeholder="Ej: BioTrace Derma" class="form-input" />
            </div>

            <div class="form-group">
              <label>Reactor / Marmita *</label>
              <select [(ngModel)]="formData.reactor" name="reactor" class="form-select">
                <option value="Reactor R-101 (Inox 500L)">Reactor R-101 (Inox 500L)</option>
                <option value="Reactor R-102 (Inox 250L)">Reactor R-102 (Inox 250L)</option>
                <option value="Marmita Calefactora M-01 (100L)">Marmita Calefactora M-01 (100L)</option>
                <option value="Homogenizador Turbo-200">Homogenizador Turbo-200</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tamaño del Lote (Kg / L) *</label>
              <input type="number" [(ngModel)]="formData.tamanoLote" name="tamanoLote" required placeholder="250" class="form-input" />
            </div>

            <div class="form-group">
              <label>Fecha de Fabricación *</label>
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
              <span>Agregar Paso</span>
            </button>
          </div>

          <div class="pasos-table-wrap">
            <table class="pasos-table">
              <thead>
                <tr>
                  <th style="width: 70px;">Paso</th>
                  <th>Procedimiento Detallado</th>
                  <th style="width: 110px;">RPM</th>
                  <th style="width: 110px;">Tiempo</th>
                  <th style="width: 120px;">Temperatura</th>
                  <th style="width: 140px;">Realizado Por</th>
                  <th style="width: 60px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of pasos; let i = index">
                  <td class="text-center font-bold">#{{ p.pasoNumero }}</td>
                  <td>
                    <textarea
                      [(ngModel)]="p.procedimiento"
                      [name]="'proc_' + i"
                      rows="2"
                      class="step-textarea"
                      placeholder="Descripción de la adición de ingredientes o agitación..."
                    ></textarea>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.rpm" [name]="'rpm_' + i" placeholder="400 RPM" class="step-input" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.tiempo" [name]="'tiempo_' + i" placeholder="20 min" class="step-input" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.temperatura" [name]="'temp_' + i" placeholder="Ambiente / 65°C" class="step-input" />
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="p.realizadoPor" [name]="'operador_' + i" placeholder="Operario" class="step-input" />
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
              <label>Operador Responsable de Fabricación *</label>
              <input type="text" [(ngModel)]="formData.operadorResponsable" name="operadorResponsable" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Supervisor de Planta *</label>
              <input type="text" [(ngModel)]="formData.supervisor" name="supervisor" placeholder="Ing. Químico de Turno" class="form-input" />
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
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      color: #7e22ce;
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
      padding: 0.65rem 0.85rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }
    .checklist-text {
      font-size: 0.825rem;
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
      padding: 4px 10px;
      font-size: 0.72rem;
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

    /* TABLA DE PASOS */
    .pasos-table-wrap {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      overflow-x: auto;
    }
    .pasos-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
    }
    .pasos-table th {
      background: #f8fafc;
      padding: 0.75rem 0.85rem;
      text-align: left;
      font-weight: 700;
      color: #475569;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .pasos-table td {
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .step-textarea {
      width: 100%;
      padding: 0.45rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.8rem;
      outline: none;
      box-sizing: border-box;
    }
    .step-input {
      width: 100%;
      padding: 0.45rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.8rem;
      outline: none;
      box-sizing: border-box;
    }
    .step-textarea:focus, .step-input:focus {
      border-color: #9333ea;
    }
    .btn-delete-row {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 4px;
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
    .btn-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.78rem;
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
    .btn-secondary:hover {
      background: #f1f5f9;
    }
    .btn-outline {
      background: #ffffff;
      border-color: #e2e8f0;
      color: #0f172a;
    }
    .btn-outline:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .alert {
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
    numeroPedido: 'PED-2026-001',
    lote: 'LOT-SH-2026-001',
    nombreProducto: 'Sérum Facial Ácido Hialurónico 2%',
    marca: 'BioTrace Derma Care',
    reactor: 'Reactor R-101 (Inox 500L)',
    tamanoLote: 150,
    fecha: new Date().toISOString().split('T')[0],
    operadorResponsable: this.auth.currentUser()?.name || 'Carlos Mendoza',
    supervisor: 'Ing. Químico de Planta',
    observaciones: 'Control de agitación y temperatura constante. Muestra enviada a control de calidad.'
  };

  pasos: PasoFabricacion[] = [
    {
      pasoNumero: 1,
      procedimiento: 'Adicionar agua desionizada purificada e iniciar agitación suave constante.',
      rpm: '350 RPM',
      tiempo: '15 min',
      temperatura: '22°C',
      realizadoPor: 'Carlos M.'
    },
    {
      pasoNumero: 2,
      procedimiento: 'Incorporar polímero espesante poco a poco hasta completa hidratación sin grumos.',
      rpm: '900 RPM',
      tiempo: '25 min',
      temperatura: '22°C',
      realizadoPor: 'Carlos M.'
    },
    {
      pasoNumero: 3,
      procedimiento: 'Incorporación de Ácido Hialurónico y Glicerina en frío hasta homogenización.',
      rpm: '600 RPM',
      tiempo: '20 min',
      temperatura: '23°C',
      realizadoPor: 'Carlos M.'
    }
  ];

  ngOnInit() {
    const peds = this.data.pedidos();
    if (peds.length > 0) {
      this.formData.numeroPedido = peds[0].numeroPedido;
      this.formData.lote = peds[0].loteAsignado;
      this.formData.nombreProducto = peds[0].productoNombre;
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
      numeroPedido: this.formData.numeroPedido,
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

