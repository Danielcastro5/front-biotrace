# AGENTS.md — Arquitectura & Responsabilidades Exclusivas del Frontend (BioTrace)

Este documento detalla todas las funcionalidades, componentes, flujos de estado y decisiones de diseño implementadas estrictamente en la capa del **Frontend** (`front-biotrace`). Sirve como guía técnica para agentes y desarrolladores que interactúen con esta base de código.

---

## 1. Alcance Exclusivo del Frontend (Separación Estricta con el Backend)

El Frontend de BioTrace es responsable exclusivamente de la experiencia visual, la ergonomía operativa en planta, el enrutamiento del cliente, la validación interactiva y la presentación fluida de los datos de trazabilidad.

### Lo que pertenece ESTRICTAMENTE al Frontend:
1. **Enrutamiento y Protección de Rutas:** CanActivate guards (`authGuard`) y resolución de URLs sin depender de renderizado en servidor.
2. **Desacoplamiento Funcional:** Separación física de cada submódulo en páginas independientes de `formato` (captura) y `registros` (auditoría/consulta). Si falla un componente de captura, la tabla de registros sigue funcionando sin verse afectada.
3. **Store Reactivo de Alta Fidelidad (`TraceabilityDataService`):** Manejo de estado local con Angular Signals (`signal`, `computed`) para operaciones inmediatas, simulación interactiva completa y sincronización optimista con el backend.
4. **Sistema de Diseño y Adaptabilidad de Pantalla:** Reglas CSS fluidas (`100% width`, `registros-common.css`) optimizadas para monitores industriales y de oficina (pantallas de 27 pulgadas, 1080p, 2K y 4K), eliminando desbordamientos y barras horizontales innecesarias.
5. **Inteligencia Operativa en Formularios:** Auto-completado de fórmulas maestras, cálculo automático de pesos teóricos, balance de masa en tiempo real y asignación de lotes.
6. **Línea de Trazabilidad 360°:** Algoritmo de resolución en cliente que mapea desde una orden de pedido o número de lote hacia todos sus eslabones (Consumo, Fabricación, Calidad y Materias Primas).

---

## 2. Estructura de Directorios en Capas (`src/app/pages/`)

Toda la aplicación está jerárquicamente estructurada bajo una convención limpia y modular:

```text
src/app/
├── core/                                # Servicios singleton, interceptores y contratos
│   ├── guards/                          # auth.guard.ts (protección de sesión)
│   ├── interceptors/                    # auth.interceptor.ts (inyección de JWT Bearer)
│   ├── models/                          # traceability.models.ts (interfaces de dominio)
│   └── services/                        # api.service.ts, auth.service.ts, ui-state.service.ts
│       └── traceability-data.service.ts # Store reactivo de señales de trazabilidad
│
├── pages/                               # Todas las páginas y pantallas del sistema
│   ├── login/                           # Pantalla de acceso con estética Dermo-Pharma
│   └── trazabilidad/
│       ├── inicio/                      # Panel principal con KPIs, accesos rápidos y feeds
│       │
│       ├── estaciones/                  # Estaciones operativas de planta
│       │   ├── materia-prima/
│       │   │   ├── ingreso/
│       │   │   │   ├── formato/         # mp-ingreso-formato.component.ts
│       │   │   │   └── registros/       # mp-ingreso-registros.component.ts
│       │   │   ├── consumo/
│       │   │   │   ├── formato/         # mp-consumo-formato.component.ts (auto-carga fórmula)
│       │   │   │   └── registros/       # mp-consumo-registros.component.ts
│       │   │   └── inventario/          # mp-inventario.component.ts
│       │   │
│       │   ├── fabricacion/
│       │   │   ├── formato/             # fabricacion-formato.component.ts (despeje 7/7 y fases)
│       │   │   └── registros/           # fabricacion-registros.component.ts
│       │   │
│       │   ├── control-calidad/
│       │   │   ├── formato/             # calidad-formato.component.ts (dictamen y COA)
│       │   │   └── registros/           # calidad-registros.component.ts
│       │   │
│       │   └── trazabilidad-360/        # trazabilidad-360.component.ts (página única integral)
│       │
│       └── comercial/                   # Módulo comercial y ventas
│           ├── clientes/
│           │   ├── formato/             # clientes-formato.component.ts
│           │   └── registros/           # clientes-registros.component.ts
│           ├── productos/
│           │   ├── formato/             # productos-formato.component.ts (fórmulas maestras)
│           │   └── registros/           # productos-registros.component.ts
│           └── pedidos/
│               ├── formato/             # pedidos-formato.component.ts (vínculo cliente/producto)
│               └── registros/           # pedidos-registros.component.ts (botón Dar Salida)
│
└── shared/                              # Componentes transversales y estilos globales
    ├── components/
    │   ├── navbar.component.ts          # Barra superior con buscador predictivo y tuerca
    │   └── sidebar.component.ts         # Menú lateral con acordeones y auto-expansión
    └── styles/
        └── registros-common.css         # Hoja de estilos compartida para vistas de registros
```

---

## 3. Desacoplamiento de Formularios (`formato`) y Tablas (`registros`)

Siguiendo las mejores prácticas de arquitectura frontend, ninguna estación comparte vista de edición/creación con su tabla de auditoría:
* Cada submenú tiene su propia ruta dedicada:
  * `/trazabilidad/estaciones/.../formato`
  * `/trazabilidad/estaciones/.../registros`
* Si el operador comete un error en un campo o un script del formulario entra en excepción, la tabla de registros permanece intacta.
* Las páginas de registros implementan modales ligeros para:
  * **Ver Detalle Completo:** Inspección enriquecida sin perder el contexto de la tabla.
  * **Editar Registro:** Modificación en línea con actualización reactiva instantánea.
  * **Eliminar Registro:** Confirmación con diálogo de advertencia de seguridad.

---

## 4. Sistema de Diseño Compartido (`registros-common.css`)

Todas las pantallas de "Ver Registros" comparten una experiencia visual consistente inspirada en el estándar Laprobell:
* **Cabecera técnica oscura (`#0f172a`):** Con tipografía estructurada y distintivos de código mono para números de lote y órdenes.
* **Badges semánticos:** Estados de calidad (`Aprobado`, `Cuarentena`, `Rechazado`), fases de proceso (`En Proceso`, `Conforme`) y estados comerciales (`Listo para Despacho`, `Despachado (Salida Autorizada)`).
* **Botones de acción estándar:**
  * `.action-btn--view` (Ojo): Despliega modal analítico con desgloses, balance y certificados.
  * `.action-btn--edit` (Lápiz): Abre edición in-situ.
  * `.action-btn--delete` (Papelera): Confirmación de baja del registro.
  * `.action-btn--dispatch` (Dar Salida): Botón exclusivo de Pedidos para autorizar salida.
* **Adaptabilidad fluida (Full Width):** Sin tope restrictivo de 1200px. Ocupa el 100% del contenedor en pantallas de 27" y ultrawide, con espaciado lateral limpio (`padding: 1.25rem 2rem`) y scrollbar táctil estilizada de `6px` para pantallas reducidas.

---

## 5. Trazabilidad 360° Integral (Página Única)

Consolidada en [`trazabilidad-360.component.ts`](src/app/pages/trazabilidad/estaciones/trazabilidad-360/trazabilidad-360.component.ts):
* **Buscador Dual:** Localiza la cadena completa introduciendo un número de pedido (ej. `PED-2026-001`) o un número de lote (ej. `LOT-SH-2026-001`), además de chips rápidos de prueba.
* **Cronología de 5 Puntos Reales:**
  * **Punto 1: Orden de Pedido & Salida Comercial:** Cliente, unidades solicitadas, fecha de entrega y estado de despacho.
  * **Punto 2: Consumo de Materias Primas en Reactor:** Detalle de balance de masa (peso teórico vs peso real pesado en planta).
  * **Punto 3: Fabricación en Planta:** Verificación BPM de despeje de línea, etapas del proceso, RPM de agitación, tiempo y temperatura.
  * **Punto 4: Control de Calidad:** Certificado analítico COA, analista responsable y especificaciones fisicoquímicas/microbiológicas.
  * **Punto 5: Materias Primas de Origen:** Proveedor homologado, lote del fabricante y certificado de recepción.
* **Compatibilidad de Impresión:** Soporta impresión directa (`Ctrl + P`) formateada para auditorías sanitarias e informes técnicos.

---

## 6. Módulo Comercial con Inteligencia de Producción

* **Clientes:** Directorio corporativo con NIT, contactos comerciales y estado de cuenta.
* **Productos:** Constructor interactivo de fórmulas maestras con cálculo dinámico de porcentajes (suma 100%) y dosificación teórica en Kg.
* **Pedidos:**
  * Al seleccionar un pedido en la estación de **Consumo de Materia Prima**, el frontend extrae el producto asociado, pre-carga su fórmula maestra completa y asigna los lotes correspondientes, requiriendo del operario únicamente el peso real consumido.
  * En la tabla de registros de pedidos, el botón **Dar Salida** actualiza el estado a `Despachado (Salida Autorizada)` y habilita el enlace directo a su trazabilidad 360°.

---

## 8. Navegación, Buscador & Gestión en Barra Superior

* **Navbar (`navbar.component.ts`):**
  * Buscador predictivo que indexa el 100% de las páginas nuevas (formatos y registros de Comercial y Estaciones).
  * Botón de Tuerca (Ajustes):
    * Modal para dar de alta nuevo personal/operarios.
    * Modal de auditoría con historial de accesos y sesiones.
    * Modal de reporte de anomalías e incidencias operativas.
* **Sidebar (`sidebar.component.ts`):**
  * Acordeones anidados:
    * **Estaciones:** Materias Primas (Ingreso, Consumo, Inventario), Fabricación, Control Calidad y Trazabilidad 360°.
    * **Comercial:** Clientes, Productos y Órdenes de Pedido.
  * Detección activa de URL (`syncAccordionsWithUrl`) que expande automáticamente la sección correspondiente al navegar.


