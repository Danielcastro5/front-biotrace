import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { InicioComponent } from './pages/trazabilidad/inicio/inicio.component';

// Estaciones: Materias Primas
import { MpIngresoFormatoComponent } from './pages/trazabilidad/estaciones/materia-prima/ingreso/formato/mp-ingreso-formato.component';
import { MpIngresoRegistrosComponent } from './pages/trazabilidad/estaciones/materia-prima/ingreso/registros/mp-ingreso-registros.component';
import { MpConsumoFormatoComponent } from './pages/trazabilidad/estaciones/materia-prima/consumo/formato/mp-consumo-formato.component';
import { MpConsumoRegistrosComponent } from './pages/trazabilidad/estaciones/materia-prima/consumo/registros/mp-consumo-registros.component';
import { MpInventarioComponent } from './pages/trazabilidad/estaciones/materia-prima/inventario/mp-inventario.component';

// Estaciones: Fabricación
import { FabricacionFormatoComponent } from './pages/trazabilidad/estaciones/fabricacion/formato/fabricacion-formato.component';
import { FabricacionRegistrosComponent } from './pages/trazabilidad/estaciones/fabricacion/registros/fabricacion-registros.component';

// Estaciones: Control de Calidad
import { CalidadFormatoComponent } from './pages/trazabilidad/estaciones/control-calidad/formato/calidad-formato.component';
import { CalidadRegistrosComponent } from './pages/trazabilidad/estaciones/control-calidad/registros/calidad-registros.component';

// Estación Única: Trazabilidad 360° Integral
import { Trazabilidad360Component } from './pages/trazabilidad/estaciones/trazabilidad-360/trazabilidad-360.component';

// Módulo Comercial: Clientes
import { ClientesFormatoComponent } from './pages/trazabilidad/comercial/clientes/formato/clientes-formato.component';
import { ClientesRegistrosComponent } from './pages/trazabilidad/comercial/clientes/registros/clientes-registros.component';

// Módulo Comercial: Productos
import { ProductosFormatoComponent } from './pages/trazabilidad/comercial/productos/formato/productos-formato.component';
import { ProductosRegistrosComponent } from './pages/trazabilidad/comercial/productos/registros/productos-registros.component';

// Módulo Comercial: Pedidos & Despacho
import { PedidosFormatoComponent } from './pages/trazabilidad/comercial/pedidos/formato/pedidos-formato.component';
import { PedidosRegistrosComponent } from './pages/trazabilidad/comercial/pedidos/registros/pedidos-registros.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', redirectTo: 'trazabilidad/inicio', pathMatch: 'full' },
  { path: 'trazabilidad', redirectTo: 'trazabilidad/inicio', pathMatch: 'full' },

  // Panel Principal (Inicio estilo Laprobell)
  {
    path: 'trazabilidad/inicio',
    component: InicioComponent,
    canActivate: [authGuard]
  },

  // Estaciones - Ingreso Materia Prima (Separado en Formato y Registros)
  {
    path: 'trazabilidad/estaciones/materia-prima/ingreso',
    redirectTo: 'trazabilidad/estaciones/materia-prima/ingreso/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/materia-prima/ingreso/formato',
    component: MpIngresoFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/materia-prima/ingreso/registros',
    component: MpIngresoRegistrosComponent,
    canActivate: [authGuard]
  },

  // Estaciones - Consumo Materia Prima (Separado en Formato y Registros)
  {
    path: 'trazabilidad/estaciones/materia-prima/consumo',
    redirectTo: 'trazabilidad/estaciones/materia-prima/consumo/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/materia-prima/consumo/formato',
    component: MpConsumoFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/materia-prima/consumo/registros',
    component: MpConsumoRegistrosComponent,
    canActivate: [authGuard]
  },

  // Estaciones - Inventario y Stock
  {
    path: 'trazabilidad/estaciones/materia-prima/inventario',
    component: MpInventarioComponent,
    canActivate: [authGuard]
  },

  // Estaciones - Fabricación (Separado en Formato y Registros)
  {
    path: 'trazabilidad/estaciones/fabricacion',
    redirectTo: 'trazabilidad/estaciones/fabricacion/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/fabricacion/formato',
    component: FabricacionFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/fabricacion/registros',
    component: FabricacionRegistrosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/fabricacion/ordenes',
    redirectTo: 'trazabilidad/estaciones/fabricacion/formato',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/fabricacion/lotes',
    redirectTo: 'trazabilidad/estaciones/fabricacion/registros',
    pathMatch: 'full'
  },

  // Estaciones - Control de Calidad (Separado en Formato y Registros)
  {
    path: 'trazabilidad/estaciones/control-calidad',
    redirectTo: 'trazabilidad/estaciones/control-calidad/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/control-calidad/formato',
    component: CalidadFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/control-calidad/registros',
    component: CalidadRegistrosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/estaciones/control-calidad/liberacion',
    redirectTo: 'trazabilidad/estaciones/control-calidad/registros',
    pathMatch: 'full'
  },

  // Estación Única - Trazabilidad 360° Integral
  {
    path: 'trazabilidad/estaciones/trazabilidad-360',
    component: Trazabilidad360Component,
    canActivate: [authGuard]
  },
  // Redirecciones de compatibilidad para enlaces antiguos
  {
    path: 'trazabilidad/estaciones/trazabilidad-360/backward',
    redirectTo: 'trazabilidad/estaciones/trazabilidad-360',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/estaciones/trazabilidad-360/forward',
    redirectTo: 'trazabilidad/estaciones/trazabilidad-360',
    pathMatch: 'full'
  },

  // Comercial - Clientes
  {
    path: 'trazabilidad/comercial/clientes',
    redirectTo: 'trazabilidad/comercial/clientes/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/comercial/clientes/formato',
    component: ClientesFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/comercial/clientes/registros',
    component: ClientesRegistrosComponent,
    canActivate: [authGuard]
  },

  // Comercial - Productos
  {
    path: 'trazabilidad/comercial/productos',
    redirectTo: 'trazabilidad/comercial/productos/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/comercial/productos/formato',
    component: ProductosFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/comercial/productos/registros',
    component: ProductosRegistrosComponent,
    canActivate: [authGuard]
  },

  // Comercial - Pedidos
  {
    path: 'trazabilidad/comercial/pedidos',
    redirectTo: 'trazabilidad/comercial/pedidos/registros',
    pathMatch: 'full'
  },
  {
    path: 'trazabilidad/comercial/pedidos/formato',
    component: PedidosFormatoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trazabilidad/comercial/pedidos/registros',
    component: PedidosRegistrosComponent,
    canActivate: [authGuard]
  },

  // Redirección por defecto
  { path: '**', redirectTo: 'login' }
];
