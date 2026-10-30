# BioTrace Dermo-Pharma — Frontend SPA (ront-biotrace)

Aplicación Web Frontend para el **Sistema de Trazabilidad Industrial y Manufactura Multiproducto (BioTrace Dermo-Pharma)**, desarrollada exclusivamente con **Angular 19+**, Standalone Components, Angular Signals reactivos y sistema visual Titanio y Cian Glacial.

---

## 1. Características Técnicas

- **Framework**: Angular 19+ (Standalone Components, sin módulos NgModules legados).
- **Reactividad**: Angular Signals (signal, computed, effect) para estado y reactividad instantánea.
- **Diseño Visual**: Paleta institucional Titanio Profundo (#090d16, #0f172a, #1e293b) y Cian Glacial (#0891b2, #06b6d4, #ecfeff). Estricto CSS Grid responsive en dos columnas auto-ajustables sin rojo ni amarillo.
- **Seguridad**: Autenticación JWT con temporizador regresivo de inactividad a 30 minutos y auto-renovación silenciosa (uth.interceptor.ts).
- **Proxy de Desarrollo**: Comunicación transparente con el Backend REST en http://127.0.0.1:3000/api mediante proxy.conf.json.

---

## 2. Requisitos Previos

- **Node.js**: v20+ o v22+
- **Backend API**: Corriendo en http://127.0.0.1:3000/api (repositorio Proyecto-Trazabilidad).

---

## 3. Instalación y Ejecución

`ash
# 1. Instalar dependencias (si no están instaladas)
npm install

# 2. Iniciar servidor de desarrollo en puerto 4200 con proxy a la API
npm run dev
# o bien:
npm start
`

La aplicación estará disponible de inmediato en:
👉 **http://localhost:4200**

---

## 4. Estructura del Proyecto

`	ext
front-biotrace/
├── public/                  # Recursos estáticos e imágenes institucionales
├── src/
│   ├── index.html           # Tipografías Inter y Plus Jakarta Sans
│   ├── styles.css           # Tokens de diseño Titanio/Cian y utilidades CSS Grid
│   ├── main.ts              # Arranque Standalone de la aplicación
│   └── app/
│       ├── app.component.ts # Contenedor principal
│       ├── app.routes.ts    # Enrutamiento protegido por authGuard
│       ├── app.config.ts    # Inyección de HttpClient y authInterceptor
│       ├── core/
│       │   ├── guards/      # auth.guard.ts (Protección de rutas)
│       │   ├── interceptors/# auth.interceptor.ts (Bearer token y refresh)
│       │   ├── models/      # Modelos e interfaces TypeScript
│       │   └── services/    # auth.service.ts, api.service.ts
│       ├── shared/
│       │   └── components/  # navbar.component.ts (con timer en vivo)
│       └── features/
│           ├── auth/        # login.component.ts
│           └── home/        # home.component.ts (Módulos de trazabilidad y catálogos)
├── angular.json             # Configuración Angular CLI
├── proxy.conf.json          # Proxy de desarrollo: /api -> http://127.0.0.1:3000
├── package.json             # Scripts y dependencias
└── tsconfig.json            # Configuración TypeScript estricta
`

---

## 5. Módulos y Consultas Disponibles

1. **Dashboard & Catálogos**: Productos, Materias Primas / Principios Activos, Proveedores y Clientes de Laboratorio.
2. **Recepción e Inventario**: Lotes de materia prima, saldo en reactores y almacén.
3. **Órdenes y Fabricación**: Órdenes de formulación con balance de consumos, envasado y acondicionamiento.
4. **Control de Calidad (GMP/BPM)**: Liberación de lotes de producto terminado.
5. **Trazabilidad 360°**:
   - **Ascendente (Backward)**: Desde lote terminado hacia formulación, pesaje y lote de insumo del proveedor.
   - **Descendente (Forward)**: Desde lote de materia prima hacia reactores, lotes fabricados y clientes despachados.
