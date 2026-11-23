import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UiStateService } from './ui-state.service';
import { driver, Driver, DriveStep } from 'driver.js';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private router = inject(Router);
  private ui = inject(UiStateService);

  async iniciarGuiaPrincipal(): Promise<void> {
    // 1. Preparación inicial:
    // Navegar a /trazabilidad/inicio si no estamos ahí y esperar a que aparezca .welcome-header
    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/trazabilidad/inicio') {
      await this.router.navigateByUrl('/trazabilidad/inicio');
      await this.esperarElemento('.welcome-header', 2000);
    } else {
      await this.esperarElemento('.welcome-header', 2000);
    }

    // Esperar también (máximo ~2 s) a .kpi-section y .stations-section
    await Promise.all([
      this.esperarElemento('.kpi-section', 2000),
      this.esperarElemento('.stations-section', 2000)
    ]);

    // Si el sidebar está colapsado, expandirlo y esperar 350 ms para la animación
    if (!this.ui.sidebarExpanded()) {
      this.ui.setSidebar(true);
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    let driverObj!: Driver;

    // 2. Definición de todos los pasos
    const allSteps: DriveStep[] = [
      // Paso 1
      {
        element: '.welcome-header',
        popover: {
          title: 'Panel de Trazabilidad y Control de Calidad',
          description: 'Este es tu centro de control principal. Desde aquí supervisas el estado general de la planta y accedes a todas las operaciones bajo normativa GMP.'
        }
      },
      // Paso 2
      {
        element: '.search-box-container',
        popover: {
          title: 'Buscador Rápido',
          description: 'Escribe el nombre de cualquier estación, formato o módulo para saltar directamente a él sin navegar por los menús.'
        }
      },
      // Paso 3
      {
        element: 'button[title="Inicio"]',
        popover: {
          title: 'Panel Principal',
          description: 'Usa este acceso en cualquier momento para regresar a esta vista general.'
        }
      },
      // Paso 4
      {
        element: 'button[title="Ventas, Clientes y Pedidos"]',
        popover: {
          title: '1. Módulo Comercial',
          description: 'El flujo operativo inicia aquí, registrando clientes, productos y pedidos. Haz clic en Siguiente para desplegar sus secciones.',
          onNextClick: async () => {
            await this.asegurarAcordeonAbierto('button[title="Ventas, Clientes y Pedidos"]');
            driverObj.refresh();
            driverObj.moveNext();
          }
        }
      },
      // Paso 5: contenedor anidado comercial (función, NO filtrar de antemano)
      {
        element: () => document.querySelector('button[title="Ventas, Clientes y Pedidos"] + .lap-sidebar-nested-container') as Element,
        popover: {
          title: 'Clientes, Productos y Pedidos',
          description: 'Crea primero los clientes, administra el catálogo de productos terminados y genera las órdenes de pedido y salida.'
        }
      },
      // Paso 6
      {
        element: 'button[title="Estaciones de Producción"]',
        popover: {
          title: '2. Estaciones de Producción',
          description: 'Con los pedidos definidos, aquí se ejecutan las etapas productivas y de control. Haz clic en Siguiente para desplegar los módulos.',
          onNextClick: async () => {
            await this.asegurarAcordeonAbierto('button[title="Estaciones de Producción"]');
            driverObj.refresh();
            driverObj.moveNext();
          },
          onPrevClick: async () => {
            await this.asegurarAcordeonAbierto('button[title="Ventas, Clientes y Pedidos"]');
            driverObj.refresh();
            driverObj.movePrevious();
          }
        }
      },
      // Paso 7: contenedor anidado estaciones (función, NO filtrar de antemano)
      {
        element: () => document.querySelector('button[title="Estaciones de Producción"] + .lap-sidebar-nested-container') as Element,
        popover: {
          title: 'Módulos de Planta y Trazabilidad',
          description: 'Encontrarás Materias Primas (ingreso, consumo e inventario), Fabricación, Control de Calidad y la vista integral de Trazabilidad 360°.'
        }
      },
      // Paso 8
      {
        element: '.user-badge',
        popover: {
          title: 'Tu Perfil y Rol Activo',
          description: 'Muestra el usuario con sesión iniciada y el rol operativo asignado.',
          onPrevClick: async () => {
            await this.asegurarAcordeonAbierto('button[title="Estaciones de Producción"]');
            driverObj.refresh();
            driverObj.movePrevious();
          }
        }
      },
      // Paso 9
      {
        element: 'button.gear-btn',
        popover: {
          title: 'Opciones y Administración',
          description: 'Accede a la configuración general del sistema y herramientas administrativas.'
        }
      },
      // Paso 10
      {
        element: '.kpi-section',
        popover: {
          title: 'Indicadores Operativos de Planta',
          description: 'Monitorea en tiempo real los lotes de materia prima ingresados, dosificaciones en reactor, órdenes de fabricación y porcentaje de conformidad.'
        }
      },
      // Paso 11
      {
        element: '.stations-section',
        popover: {
          title: 'Accesos Directos a Estaciones',
          description: 'Desde estas tarjetas puedes entrar directamente a las 4 estaciones principales (EST-01 a EST-04) sin usar el menú lateral.'
        }
      },
      // Paso 12
      {
        element: '.stations-grid > .station-card:nth-child(1)',
        popover: {
          title: 'Llenar Formato vs. Ver Registros',
          description: 'Cada estación ofrece dos acciones rápidas: \'Llenar formato\' para capturar un nuevo registro operativo, y \'Ver registros\' para consultar el historial.'
        }
      }
    ];

    // Filtrar con document.querySelector SOLO los pasos cuyo elemento existe desde el inicio.
    // NO filtrar los pasos 5 y 7 que son funciones.
    const activeSteps: DriveStep[] = allSteps.filter(step => {
      if (typeof step.element === 'string') {
        return !!document.querySelector(step.element);
      }
      return true;
    });

    if (activeSteps.length === 0) {
      return;
    }

    driverObj = driver({
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      showProgress: true,
      allowClose: true,
      steps: activeSteps
    });

    driverObj.drive();
  }

  /**
   * Helper para abrir acordeones del sidebar sin cerrarlos por error.
   * Si existe y NO tiene la clase lap-sidebar-master-header--open, ejecuta .click()
   * y espera mediante sondeo (máximo ~1 s) a que aparezca su .lap-sidebar-nested-container hermano.
   */
  private async asegurarAcordeonAbierto(selectorBoton: string): Promise<void> {
    const btn = document.querySelector<HTMLButtonElement>(selectorBoton);
    if (!btn) {
      return;
    }

    if (!btn.classList.contains('lap-sidebar-master-header--open')) {
      btn.click();

      const selectorHermano = `${selectorBoton} + .lap-sidebar-nested-container`;
      const inicio = Date.now();
      while (Date.now() - inicio < 1000) {
        if (document.querySelector(selectorHermano)) {
          break;
        }
        await new Promise(r => setTimeout(r, 50));
      }

      // Pequeño margen para que termine el renderizado y animación
      await new Promise(r => setTimeout(r, 100));
    }
  }

  private esperarElemento(selector: string, timeoutMs: number): Promise<Element | null> {
    return new Promise(resolve => {
      const el = document.querySelector(selector);
      if (el) {
        return resolve(el);
      }

      const start = Date.now();
      const interval = setInterval(() => {
        const found = document.querySelector(selector);
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (Date.now() - start >= timeoutMs) {
          clearInterval(interval);
          resolve(null);
        }
      }, 50);
    });
  }
}
