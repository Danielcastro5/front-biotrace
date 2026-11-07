import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="inicio-container">
      <!-- 1. ENCABEZADO DE BIENVENIDA ESTILO LAPROBELL -->
      <div class="welcome-header">
        <div class="welcome-text">
          <h1 class="welcome-title">Panel de Trazabilidad y Control de Calidad</h1>
          <p class="welcome-desc">
            Bienvenido al sistema central de fabricación, trazabilidad y aseguramiento cosmético de <strong>BioTrace</strong>.
          </p>
        </div>

        <div class="welcome-meta">
          <div class="meta-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span>Planta Farmacéutica Central</span>
          </div>

          <div class="meta-tag meta-tag--secure">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>Sesión Segura GMP</span>
          </div>
        </div>
      </div>

      <!-- 2. TARJETA HERO CON FOTOGRAFÍA DE LABORATORIO (LAPROBELL SHOWCASE) -->
      <div class="hero-showcase-card">
        <img
          src="/images/login_showcase.jpg"
          onerror="this.src='/images/pharma_lab_bg.jpg'"
          alt="Laboratorio de formulación magistral y control de calidad"
          class="hero-card-img"
        />
        <div class="hero-card-overlay">
          <div class="hero-card-content">
            <div class="hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              </svg>
              <span>Control y Fabricación Integral</span>
            </div>
            <h2 class="hero-title">Trazabilidad Galénica en Tiempo Real</h2>
            <p class="hero-desc">
              Supervisión continua desde la recepción técnica y pesada de materias primas hasta el mezclado en reactor, liberación físico-química y despacho de lotes terminados.
            </p>
          </div>
        </div>
      </div>

      <!-- 3. MÉTRICAS OPERATIVAS & ESTADÍSTICAS EN TIEMPO REAL -->
      <div class="kpi-section">
        <div class="section-title-wrap">
          <h3 class="kpi-section-title">Indicadores Operativos de Planta</h3>
          <span class="kpi-live-pill">
            <span class="pulse-dot"></span>
            En tiempo real
          </span>
        </div>

        <div class="kpi-grid">
          <!-- KPI 1: Materias Primas -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon--cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span class="kpi-trend trend--up">+12% vs mes ant.</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats().mpIngresos }}</span>
              <span class="kpi-label">Lotes MP Ingresados</span>
              <p class="kpi-subtext">14 inspeccionados y con COA registrado</p>
            </div>
          </div>

          <!-- KPI 2: Consumo en Reactores -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <span class="kpi-trend trend--neutral">Sin mermas</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats().mpConsumos }}</span>
              <span class="kpi-label">Dosificaciones en Reactor</span>
              <p class="kpi-subtext">Principios activos & excipientes</p>
            </div>
          </div>

          <!-- KPI 3: Órdenes de Fabricación -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon--purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <span class="kpi-trend trend--up">Activas</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats().fabricaciones }}</span>
              <span class="kpi-label">Órdenes de Fabricación</span>
              <p class="kpi-subtext">Despejes de línea conformes</p>
            </div>
          </div>

          <!-- KPI 4: Liberaciones de Calidad -->
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon--emerald">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <span class="kpi-trend trend--up">100% BPM</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats().calidadLiberaciones }}%</span>
              <span class="kpi-label">Conformidad Físico-Química</span>
              <p class="kpi-subtext">pH, viscosidad y microbiología</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. ESTACIONES DE TRABAJO & ACCESOS RÁPIDOS -->
      <div class="stations-section">
        <h3 class="stations-title">Estaciones de Planta & Registros</h3>
        <p class="stations-subtitle">Selecciona el módulo para llenar formatos o consultar el historial de registros</p>

        <div class="stations-grid">
          <!-- ESTACIÓN 1: INGRESO MATERIA PRIMA -->
          <div class="station-card">
            <div class="station-card-top">
              <div class="station-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 16h6"></path>
                  <path d="M19 13v6"></path>
                  <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
                  <polyline points="3.29 7 12 12 20.71 7"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span class="station-code">EST-01</span>
            </div>
            <h4>Ingreso Materia Prima</h4>
            <p>Recepción técnica, control de cuarentena, pesada y archivo de Certificado de Análisis (COA).</p>
            <div class="station-actions">
              <a routerLink="/trazabilidad/estaciones/materia-prima/ingreso/formato" class="btn-station btn-station--form">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Llenar formato</span>
              </a>
              <a routerLink="/trazabilidad/estaciones/materia-prima/ingreso/registros" class="btn-station btn-station--list">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Ver registros</span>
              </a>
            </div>
          </div>

          <!-- ESTACIÓN 2: CONSUMO MATERIA PRIMA -->
          <div class="station-card">
            <div class="station-card-top">
              <div class="station-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <span class="station-code">EST-02</span>
            </div>
            <h4>Consumo Materia Prima</h4>
            <p>Dosificación estricta de principios activos en marmitas y reactores según orden de producción.</p>
            <div class="station-actions">
              <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/formato" class="btn-station btn-station--form">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Llenar formato</span>
              </a>
              <a routerLink="/trazabilidad/estaciones/materia-prima/consumo/registros" class="btn-station btn-station--list">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Ver registros</span>
              </a>
            </div>
          </div>

          <!-- ESTACIÓN 3: FABRICACIÓN DEL PRODUCTO -->
          <div class="station-card">
            <div class="station-card-top">
              <div class="station-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </div>
              <span class="station-code">EST-03</span>
            </div>
            <h4>Fabricación del Producto</h4>
            <p>Despeje de línea BPM, control de fases, agitación, calentamiento y homogenización de lote.</p>
            <div class="station-actions">
              <a routerLink="/trazabilidad/estaciones/fabricacion/formato" class="btn-station btn-station--form">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Llenar formato</span>
              </a>
              <a routerLink="/trazabilidad/estaciones/fabricacion/registros" class="btn-station btn-station--list">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Ver registros</span>
              </a>
            </div>
          </div>

          <!-- ESTACIÓN 4: CONTROL DE CALIDAD -->
          <div class="station-card">
            <div class="station-card-top">
              <div class="station-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </div>
              <span class="station-code">EST-04</span>
            </div>
            <h4>Control de Calidad</h4>
            <p>Análisis de parámetros físico-químicos (pH, densidad, viscosidad) y emisión de certificado COA.</p>
            <div class="station-actions">
              <a routerLink="/trazabilidad/estaciones/control-calidad/formato" class="btn-station btn-station--form">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Llenar formato</span>
              </a>
              <a routerLink="/trazabilidad/estaciones/control-calidad/registros" class="btn-station btn-station--list">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Ver registros</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inicio-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 1.25rem 2rem 3.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      box-sizing: border-box;
    }

    /* ENCABEZADO DE BIENVENIDA ESTILO LAPROBELL */
    .welcome-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .welcome-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin: 0 0 6px 0;
    }
    .welcome-desc {
      font-size: 0.925rem;
      color: #64748b;
      margin: 0;
    }
    .welcome-desc strong {
      color: #0891b2;
    }
    .welcome-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .meta-tag--secure {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }

    /* HERO SHOWCASE CARD (LAPROBELL ESTILO) */
    .hero-showcase-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.12);
      border: 1px solid #e2e8f0;
      height: 400px;
      background: #0f172a;
    }
    .hero-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      opacity: 0.85;
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .hero-showcase-card:hover .hero-card-img {
      transform: scale(1.02);
    }
    .hero-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 68%, #0f172a 100%);
      display: flex;
      align-items: flex-end;
      padding: 2.5rem;
    }
    .hero-card-content {
      max-width: 680px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      background: rgba(6, 182, 212, 0.2);
      border: 1px solid rgba(6, 182, 212, 0.5);
      border-radius: 9999px;
      color: #a5f3fc;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 0.85rem;
      backdrop-filter: blur(8px);
    }
    .hero-title {
      font-size: clamp(1.6rem, 2.3vw, 2.2rem);
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      margin: 0 0 0.65rem 0;
      letter-spacing: -0.02em;
    }
    .hero-desc {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.55;
      margin: 0;
    }

    /* SECCIÓN DE KPIS */
    .kpi-section {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .section-title-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .kpi-section-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .kpi-live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0891b2;
      background: #ecfeff;
      border: 1px solid rgba(8, 145, 178, 0.25);
      padding: 4px 10px;
      border-radius: 9999px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #0891b2;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }
    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .kpi-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon--cyan { background: #ecfeff; color: #0891b2; }
    .icon--blue { background: #eff6ff; color: #2563eb; }
    .icon--purple { background: #faf5ff; color: #9333ea; }
    .icon--emerald { background: #f0fdf4; color: #16a34a; }

    .kpi-trend {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .trend--up { background: #dcfce7; color: #15803d; }
    .trend--neutral { background: #f1f5f9; color: #475569; }

    .kpi-body {
      display: flex;
      flex-direction: column;
    }
    .kpi-val {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .kpi-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
      margin-top: 4px;
    }
    .kpi-subtext {
      font-size: 0.75rem;
      color: #64748b;
      margin: 4px 0 0 0;
    }

    /* SECCIÓN DE ESTACIONES */
    .stations-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .stations-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .stations-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 1rem 0;
    }
    .stations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .station-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }
    .station-card:hover {
      border-color: #0891b2;
      box-shadow: 0 8px 20px rgba(8, 145, 178, 0.09);
    }
    .station-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }
    .station-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ecfeff;
      color: #0891b2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .station-code {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #94a3b8;
      background: #f8fafc;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .station-card h4 {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
    }
    .station-card p {
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.45;
      margin: 0 0 1.25rem 0;
      flex: 1;
    }
    .station-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }
    .btn-station {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 0.5rem 0.6rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-station--form {
      background: #ecfeff;
      color: #0891b2;
      border: 1px solid rgba(8, 145, 178, 0.3);
    }
    .btn-station--form:hover {
      background: #0891b2;
      color: #ffffff;
    }
    .btn-station--list {
      background: #f8fafc;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    .btn-station--list:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    @media (max-width: 768px) {
      .hero-showcase-card {
        height: 320px;
      }
      .hero-card-overlay {
        padding: 1.5rem;
      }
      .station-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InicioComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  stats = signal({
    mpIngresos: 14,
    mpConsumos: 18,
    fabricaciones: 6,
    calidadLiberaciones: 100
  });

  ngOnInit() {
    this.cargarEstadisticas();
  }

  private cargarEstadisticas() {
    this.api.list<any>('inventory').subscribe({
      next: (items) => {
        if (items && items.length) {
          this.stats.update(s => ({ ...s, mpIngresos: items.length }));
        }
      },
      error: () => {}
    });

    this.api.list<any>('consumptions').subscribe({
      next: (consumos) => {
        if (consumos && consumos.length) {
          this.stats.update(s => ({ ...s, mpConsumos: consumos.length }));
        }
      },
      error: () => {}
    });

    this.api.list<any>('production-orders').subscribe({
      next: (orders) => {
        if (orders && orders.length) {
          this.stats.update(s => ({ ...s, fabricaciones: orders.length }));
        }
      },
      error: () => {}
    });
  }
}
