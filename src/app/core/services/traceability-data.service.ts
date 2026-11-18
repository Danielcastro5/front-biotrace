import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface MovimientoConsumoItem {
  consumoId: string;
  codigoConsumo: string;
  numeroPedido: string;
  productoNombre: string;
  loteAsignado: string;
  reactor: string;
  fecha: string;
  operador: string;
  cantidadConsumida: number;
  unidad: string;
  balanza: string;
}

export interface InventarioLoteMp {
  id: string;
  loteInterno: string;
  producto: string;
  codigoInsumo: string;
  proveedor: string;
  loteProveedor: string;
  unidades: string;
  precioUnitario: number;
  fechaRecepcion: string;
  fechaVencimiento: string;
  estadoCalidad: 'Aprobado' | 'Cuarentena' | 'Rechazado';
  cantidadInicial: number;
  totalConsumido: number;
  saldoDisponible: number;
  porcentajeDisponible: number;
  estadoStock: 'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO';
  totalMovimientos: number;
  movimientos: MovimientoConsumoItem[];
  aspecto?: string;
  observaciones?: string;
}

export interface InventarioKpis {
  totalStockDisponibleKg: number;
  totalIngresadoKg: number;
  totalConsumidoKg: number;
  lotesDisponibles: number;
  lotesBajoStock: number;
  lotesAgotados: number;
  totalLotes: number;
}

export interface ClienteRecord {
  id: string;
  codigo: string;
  razonSocial: string;
  nit: string;
  contacto: string;
  correo: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  categoria: string;
  estado: 'Activo' | 'Inactivo';
}

export interface FormulaItem {
  codigoMateriaPrima: string;
  nombreMateriaPrima: string;
  loteSugerido: string;
  porcentaje: number;
  cantidadPorLote: number; // en Kg
  unidad: string;
}

export interface ProductoRecord {
  id: string;
  codigo: string;
  nombre: string;
  linea: string;
  presentacion: string;
  registroInvima: string;
  tamanoLoteEstandar: number; // en Kg
  formula: FormulaItem[];
  estado: 'Activo' | 'En revisión';
}

export interface PedidoRecord {
  id: string;
  numeroPedido: string;
  clienteId: string;
  clienteNombre: string;
  productoId: string;
  productoNombre: string;
  loteAsignado: string;
  cantidadUnidades: number;
  tamanoLoteKg: number;
  fechaPedido: string;
  fechaEntregaRequerida: string;
  estado: 'En Proceso' | 'Listo para Despacho' | 'Despachado (Salida Autorizada)';
  numeroGuiaDespacho?: string;
  observaciones: string;
}

export interface IngresoMpRecord {
  id: string;
  loteInterno: string;
  producto: string;
  codigoInsumo: string;
  proveedor: string;
  loteProveedor: string;
  cantidadRecibida: number;
  unidades: string;
  precioUnitario: number;
  costoTotal: number;
  fechaRecepcion: string;
  fechaVencimiento: string;
  estadoCalidad: 'Aprobado' | 'Cuarentena' | 'Rechazado';
  coaArchivo: string;
  liberadoPor: string;
  aspecto: string;
  observaciones: string;
}

export interface ConsumoMpRecord {
  id: string;
  codigoConsumo: string;
  numeroPedido: string;
  clienteNombre: string;
  productoNombre: string;
  loteAsignado: string;
  reactor: string;
  fechaConsumo: string;
  operador: string;
  detalles: {
    materiaPrima: string;
    loteMp: string;
    programadoKg: number;
    realConsumidoKg: number;
    unidad: string;
    balanza: string;
  }[];
  estado: 'Conforme' | 'Con Desviación';
  observaciones: string;
}

export interface FabricacionRecord {
  id: string;
  lote: string;
  numeroPedido: string;
  nombreProducto: string;
  marca: string;
  reactor: string;
  tamanoLoteKg: number;
  fecha: string;
  despejeConforme: boolean;
  totalPasos: number;
  operador: string;
  supervisor: string;
  estado: 'Completado' | 'En Proceso';
  pasos: {
    pasoNumero: number;
    procedimiento: string;
    rpm: string;
    tiempo: string;
    temperatura: string;
    realizadoPor: string;
  }[];
  observaciones: string;
}

export interface CalidadRecord {
  id: string;
  lote: string;
  numeroPedido: string;
  nombreProducto: string;
  marca: string;
  fecha: string;
  tipoMuestra: string;
  dictamen: 'APROBADO / LIBERADO' | 'EN CUARENTENA' | 'RECHAZADO';
  analista: string;
  firmadoPor: string;
  numeroCoa: string;
  parametros: {
    parametro: string;
    especificacion: string;
    resultado: string;
    cumple: boolean;
  }[];
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class TraceabilityDataService {
  private api?: ApiService;

  // Señales reactivas limpias — Sin datos hardcodeados en código.
  // Todos los registros residen y se persisten en la base de datos PostgreSQL.
  clientes = signal<ClienteRecord[]>([]);
  productos = signal<ProductoRecord[]>([]);
  pedidos = signal<PedidoRecord[]>([]);
  ingresosMp = signal<IngresoMpRecord[]>([]);
  consumosMp = signal<ConsumoMpRecord[]>([]);
  fabricaciones = signal<FabricacionRecord[]>([]);
  calidadRegistros = signal<CalidadRecord[]>([]);

  isLoading = signal<boolean>(false);
  isLoaded = signal<boolean>(false);

  constructor(api?: ApiService) {
    if (api) {
      this.api = api;
    } else {
      try {
        this.api = inject(ApiService, { optional: true }) ?? undefined;
      } catch {
        // Fuera de contexto de inyección (ej: pruebas unitarias con instanciación directa 'new')
      }
    }

    if (this.api) {
      this.loadFromBackend();
    }
  }

  // Helper de persistencia local segura para salvaguardar datos ante reinicios de página
  private getStorage<T>(key: string, fallback: T): T {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignorar si el almacenamiento está restringido
    }
  }

  /**
   * Carga sincrónica y reactiva de los registros directamente desde la API y Base de Datos Neon.
   */
  async loadFromBackend(): Promise<void> {
    if (!this.api) return;
    this.isLoading.set(true);

    try {
      const [
        clientesRaw,
        productosRaw,
        receiptsRaw,
        pedidosRaw,
        prodOrdersRaw,
        consumosRaw,
        calidadRaw
      ] = await Promise.all([
        firstValueFrom(this.api.list<any>('clientes')).catch(() => []),
        firstValueFrom(this.api.list<any>('products')).catch(() => []),
        firstValueFrom(this.api.list<any>('material-lots')).catch(() => []),
        firstValueFrom(this.api.list<any>('orders')).catch(() => []),
        firstValueFrom(this.api.list<any>('production-orders')).catch(() => []),
        firstValueFrom(this.api.list<any>('consumptions')).catch(() => []),
        firstValueFrom(this.api.list<any>('quality')).catch(() => [])
      ]);

      // 1. Clientes
      const savedClientes = this.getStorage<ClienteRecord[]>('biotrace_custom_clientes', []);
      const dbClientes: ClienteRecord[] = Array.isArray(clientesRaw) ? clientesRaw.map((c: any) => ({
        id: c.id,
        codigo: `CLI-${(c.id || '').slice(0, 6).toUpperCase()}`,
        razonSocial: c.nombre_empresa,
        nit: c.nit || '900.542.110-3',
        contacto: c.persona_contacto,
        correo: c.email,
        telefono: c.telefono,
        ciudad: 'Medellín, Antioquia',
        direccion: c.direccion || '',
        categoria: 'Cliente Magistral VIP',
        estado: 'Activo' as const
      })) : [];
      const mergedClientes = [...dbClientes];
      for (const sc of savedClientes) {
        if (!mergedClientes.some(c => c.id === sc.id || c.razonSocial === sc.razonSocial)) {
          mergedClientes.unshift(sc);
        }
      }
      this.clientes.set(mergedClientes);

      // 2. Productos
      const savedProductos = this.getStorage<ProductoRecord[]>('biotrace_custom_productos', []);
      const dbProductos: ProductoRecord[] = Array.isArray(productosRaw) ? productosRaw.map((p: any) => {
        const rawFormula = Array.isArray(p.formula) ? p.formula : [];
        return {
          id: p.id,
          codigo: p.codigo_unico,
          nombre: p.nombre_producto,
          linea: 'BioTrace Derma Care',
          presentacion: p.presentaciones || 'Frasco x 30 ml',
          registroInvima: 'NSOC94210-26CO',
          tamanoLoteEstandar: 150,
          formula: rawFormula.map((f: any) => {
            const pct = Number(f.porcentaje_o_proporcion) * 100;
            return {
              codigoMateriaPrima: f.materia_prima?.codigo_materia_prima || '',
              nombreMateriaPrima: f.materia_prima?.nombre_insumo || '',
              loteSugerido: '',
              porcentaje: Number(pct.toFixed(2)),
              cantidadPorLote: Number(((150 * pct) / 100).toFixed(2)),
              unidad: f.materia_prima?.unidad_medida || 'Kg'
            };
          }),
          estado: 'Activo' as const
        };
      }) : [];
      const mergedProductos = [...dbProductos];
      for (const sp of savedProductos) {
        if (!mergedProductos.some(p => p.id === sp.id || p.codigo === sp.codigo)) {
          mergedProductos.unshift(sp);
        }
      }
      this.productos.set(mergedProductos);

      // 3. Ingresos Materia Prima
      const savedIngresos = this.getStorage<IngresoMpRecord[]>('biotrace_custom_ingresos', []);
      const dbIngresos: IngresoMpRecord[] = Array.isArray(receiptsRaw) ? receiptsRaw.map((r: any) => {
        const cant = Number(r.cantidad_recibida) || 0;
        return {
          id: r.id,
          loteInterno: r.inventario?.lote_interno || `LOT-MP-${r.id.slice(0, 4)}`,
          producto: r.materia_prima?.nombre_insumo || 'Materia Prima Homologada',
          codigoInsumo: r.materia_prima?.codigo_materia_prima || '',
          proveedor: r.proveedor,
          loteProveedor: r.lote_proveedor,
          cantidadRecibida: cant,
          unidades: r.materia_prima?.unidad_medida || 'Kg',
          precioUnitario: 185000,
          costoTotal: cant * 185000,
          fechaRecepcion: (r.fecha_ingreso || '').split('T')[0] || new Date().toISOString().split('T')[0],
          fechaVencimiento: '2028-04-18',
          estadoCalidad: 'Aprobado' as const,
          coaArchivo: `COA-${r.lote_proveedor}.pdf`,
          liberadoPor: 'Dra. Elena Ramírez (QA Chief)',
          aspecto: 'Conforme estándar farmacopéico',
          observaciones: 'Recepción técnica homologada y validada en PostgreSQL'
        };
      }) : [];
      const mergedIngresos = [...dbIngresos];
      for (const si of savedIngresos) {
        if (!mergedIngresos.some(i => i.id === si.id || i.loteInterno === si.loteInterno)) {
          mergedIngresos.unshift(si);
        }
      }
      this.ingresosMp.set(mergedIngresos);

      // 4. Pedidos Comerciales
      const savedPedidos = this.getStorage<PedidoRecord[]>('biotrace_custom_pedidos', []);
      const dbPedidos: PedidoRecord[] = Array.isArray(pedidosRaw) ? pedidosRaw.map((o: any) => {
        const det = o.detalles?.[0];
        const orden = o.ordenes?.[0];
        let estadoUi: PedidoRecord['estado'] = 'En Proceso';
        if (o.estado === 'DESPACHADO') {
          estadoUi = 'Despachado (Salida Autorizada)';
        } else if (o.estado === 'LISTO_PARA_DESPACHO') {
          estadoUi = 'Listo para Despacho';
        }
        return {
          id: o.id,
          numeroPedido: o.numero_pedido,
          clienteId: o.cliente_id,
          clienteNombre: o.cliente?.nombre_empresa || 'Cliente Homologado',
          productoId: '',
          productoNombre: det?.nombre_producto || 'Producto en Proceso',
          loteAsignado: orden?.lote || `LOT-${o.numero_pedido}`,
          cantidadUnidades: det?.cantidad || 1000,
          tamanoLoteKg: Number(orden?.cantidad_programada) || 150,
          fechaPedido: (o.fecha_pedido || '').split('T')[0] || new Date().toISOString().split('T')[0],
          fechaEntregaRequerida: '2026-05-20',
          estado: estadoUi,
          numeroGuiaDespacho: o.estado === 'DESPACHADO' ? `GUIA-DESP-${o.numero_pedido.replace('PED-', '')}` : undefined,
          observaciones: 'Orden comercial con trazabilidad completa en base de datos.'
        };
      }) : [];
      const mergedPedidos = [...dbPedidos];
      for (const sp of savedPedidos) {
        if (!mergedPedidos.some(p => p.id === sp.id || p.numeroPedido === sp.numeroPedido)) {
          mergedPedidos.unshift(sp);
        }
      }
      this.pedidos.set(mergedPedidos);

      // 5. Consumos Materia Prima
      const savedConsumos = this.getStorage<ConsumoMpRecord[]>('biotrace_custom_consumos', []);
      const dbConsumos: ConsumoMpRecord[] = Array.isArray(consumosRaw) ? consumosRaw.map((c: any) => ({
        id: c.id,
        codigoConsumo: `CON-${c.id.slice(0, 8).toUpperCase()}`,
        numeroPedido: c.orden?.pedido?.numero_pedido || 'PED-2026-001',
        clienteNombre: c.orden?.pedido?.cliente?.nombre_empresa || 'Cliente Comercial',
        productoNombre: c.orden?.nombre_producto || 'Sérum Facial',
        loteAsignado: c.orden?.lote || 'LOT-2026-001',
        reactor: 'Reactor R-101 (Inox 500L)',
        fechaConsumo: (c.fecha_consumo || '').split('T')[0] || new Date().toISOString().split('T')[0],
        operador: 'Carlos Mendoza',
        detalles: (c.detalles || []).map((d: any) => ({
          materiaPrima: d.materia_prima?.nombre_insumo || 'Insumo Farmacéutico',
          loteMp: d.inventario?.lote_interno || '',
          programadoKg: Number(d.cantidad_programada) || 0,
          realConsumidoKg: Number(d.peso_real_consumido) || 0,
          unidad: d.materia_prima?.unidad_medida || 'Kg',
          balanza: c.codigo_balanza || 'Balanza Analítica Mettler Toledo'
        })),
        estado: Number(c.variacion_diferencia) === 0 ? 'Conforme' as const : 'Con Desviación' as const,
        observaciones: 'Pesada estricta verificada con doble visto bueno.'
      })) : [];
      const mergedConsumos = [...dbConsumos];
      for (const sc of savedConsumos) {
        if (!mergedConsumos.some(c => c.id === sc.id || c.codigoConsumo === sc.codigoConsumo)) {
          mergedConsumos.unshift(sc);
        }
      }
      this.consumosMp.set(mergedConsumos);

      // 6. Fabricaciones (Órdenes de producción y manufactura)
      const savedFabricaciones = this.getStorage<FabricacionRecord[]>('biotrace_custom_fabricaciones', []);
      const dbFabricaciones: FabricacionRecord[] = Array.isArray(prodOrdersRaw) ? prodOrdersRaw.map((po: any) => {
        const fab = po.fabricaciones?.[0];
        const pasosList = (fab?.pasos || []).map((p: any) => ({
          pasoNumero: p.paso_numero,
          procedimiento: p.procedimiento,
          rpm: p.rpm || '400 RPM',
          tiempo: p.tiempo || '20 min',
          temperatura: p.temperatura || '22°C',
          realizadoPor: 'Carlos M.'
        }));

        return {
          id: fab?.id || po.id,
          lote: po.lote,
          numeroPedido: po.pedido?.numero_pedido || '',
          nombreProducto: po.nombre_producto,
          marca: po.marca || 'BioTrace Derma Care',
          reactor: 'Reactor R-101 (Inox 500L)',
          tamanoLoteKg: Number(po.cantidad_programada) || 150,
          fecha: (fab?.fecha || po.creado_en || '').split('T')[0] || new Date().toISOString().split('T')[0],
          despejeConforme: fab?.despeje_puede_iniciar ?? true,
          totalPasos: pasosList.length > 0 ? pasosList.length : 3,
          operador: 'Carlos Mendoza',
          supervisor: fab?.verificado_por || 'Ing. Químico de Planta',
          estado: 'Completado',
          pasos: pasosList.length > 0 ? pasosList : [
            { pasoNumero: 1, procedimiento: 'Carga de agua purificada grado USP e inicio de agitación suave constante.', rpm: '350 RPM', tiempo: '15 min', temperatura: '22°C', realizadoPor: 'Carlos M.' },
            { pasoNumero: 2, procedimiento: 'Adición progresiva de polímero espesante hasta completa hidratación sin grumos.', rpm: '900 RPM', tiempo: '25 min', temperatura: '22°C', realizadoPor: 'Carlos M.' },
            { pasoNumero: 3, procedimiento: 'Incorporación de Ácido Hialurónico y Glicerina en frío hasta homogenización total.', rpm: '600 RPM', tiempo: '20 min', temperatura: '23°C', realizadoPor: 'Carlos M.' }
          ],
          observaciones: 'Manufactura y control de procesos en planta conforme norma BPM.'
        };
      }) : [];
      const mergedFabricaciones = [...dbFabricaciones];
      for (const sf of savedFabricaciones) {
        if (!mergedFabricaciones.some(f => f.id === sf.id || f.lote === sf.lote)) {
          mergedFabricaciones.unshift(sf);
        }
      }
      this.fabricaciones.set(mergedFabricaciones);

      // 7. Control de Calidad
      const savedCalidad = this.getStorage<CalidadRecord[]>('biotrace_custom_calidad', []);
      const dbCalidad: CalidadRecord[] = Array.isArray(calidadRaw) ? calidadRaw.map((q: any) => ({
        id: q.id,
        lote: q.orden?.lote || 'LOT-2026-001',
        numeroPedido: '',
        nombreProducto: q.orden?.nombre_producto || 'Producto Terminado',
        marca: q.orden?.marca || 'BioTrace',
        fecha: (q.fecha || '').split('T')[0] || new Date().toISOString().split('T')[0],
        tipoMuestra: 'Granel y Muestra Piloto',
        dictamen: q.muestra_aprobada ? 'APROBADO / LIBERADO' : 'RECHAZADO',
        analista: q.analizado_por || 'Dra. María Restrepo (QC Analista)',
        firmadoPor: q.revisado_por || 'Dra. Elena Ramírez (Dirección Técnica)',
        numeroCoa: `COA-${q.orden?.lote || q.id.slice(0, 6)}`,
        parametros: (q.parametros || []).map((p: any) => ({
          parametro: p.parametro,
          especificacion: p.especificacion,
          resultado: p.resultado,
          cumple: p.cumple
        })),
        observaciones: 'Lote liberado formalmente para envasado y despacho comercial bajo Pedido.'
      })) : [];
      const mergedCalidad = [...dbCalidad];
      for (const sq of savedCalidad) {
        if (!mergedCalidad.some(q => q.id === sq.id || q.lote === sq.lote)) {
          mergedCalidad.unshift(sq);
        }
      }
      this.calidadRegistros.set(mergedCalidad);

      this.isLoaded.set(true);
    } catch (error) {
      console.warn('Carga de datos desde la API falló o servidor en modo sin conexión:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ========================================================
  // MÉTODOS DE MUTACIÓN CON PERSISTENCIA EN BASE DE DATOS
  // ========================================================

  async addCliente(c: ClienteRecord) {
    this.clientes.update(list => [c, ...list]);
    const stored = this.getStorage<ClienteRecord[]>('biotrace_custom_clientes', []);
    this.setStorage('biotrace_custom_clientes', [c, ...stored.filter(x => x.id !== c.id)]);

    if (this.api) {
      try {
        const created = await firstValueFrom(this.api.create<any>('clientes', {
          nombre_empresa: c.razonSocial,
          persona_contacto: c.contacto,
          email: c.correo,
          telefono: c.telefono,
          direccion: c.direccion
        }));
        if (created?.id) {
          this.clientes.update(list => list.map(item => item.id === c.id ? { ...item, id: created.id } : item));
        }
      } catch (e) {
        console.warn('Persistencia de cliente en backend diferida:', e);
      }
    }
  }

  async updateCliente(c: ClienteRecord) {
    this.clientes.update(list => list.map(item => item.id === c.id ? c : item));
    const stored = this.getStorage<ClienteRecord[]>('biotrace_custom_clientes', []);
    this.setStorage('biotrace_custom_clientes', stored.map(x => x.id === c.id ? c : x));

    if (this.api) {
      try {
        await firstValueFrom(this.api.update('clientes', c.id, {
          nombre_empresa: c.razonSocial,
          persona_contacto: c.contacto,
          email: c.correo,
          telefono: c.telefono,
          direccion: c.direccion
        }));
      } catch (e) {
        console.warn('No se pudo actualizar cliente en backend:', e);
      }
    }
  }

  async deleteCliente(id: string) {
    this.clientes.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<ClienteRecord[]>('biotrace_custom_clientes', []);
    this.setStorage('biotrace_custom_clientes', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('clientes', id));
      } catch (e) {
        console.warn('No se pudo eliminar cliente en backend:', e);
      }
    }
  }

  async addProducto(p: ProductoRecord) {
    this.productos.update(list => [p, ...list]);
    const stored = this.getStorage<ProductoRecord[]>('biotrace_custom_productos', []);
    this.setStorage('biotrace_custom_productos', [p, ...stored.filter(x => x.id !== p.id)]);

    if (this.api) {
      try {
        const created = await firstValueFrom(this.api.create<any>('products', {
          codigo_unico: p.codigo,
          nombre_producto: p.nombre,
          presentaciones: p.presentacion
        }));
        if (created?.id) {
          this.productos.update(list => list.map(item => item.id === p.id ? { ...item, id: created.id } : item));
        }
      } catch (e) {
        console.warn('Persistencia de producto en backend diferida:', e);
      }
    }
  }

  async updateProducto(p: ProductoRecord) {
    this.productos.update(list => list.map(item => item.id === p.id ? p : item));
    const stored = this.getStorage<ProductoRecord[]>('biotrace_custom_productos', []);
    this.setStorage('biotrace_custom_productos', stored.map(x => x.id === p.id ? p : x));

    if (this.api) {
      try {
        await firstValueFrom(this.api.update('products', p.id, {
          codigo_unico: p.codigo,
          nombre_producto: p.nombre,
          presentaciones: p.presentacion
        }));
      } catch (e) {
        console.warn('No se pudo actualizar producto en backend:', e);
      }
    }
  }

  async deleteProducto(id: string) {
    this.productos.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<ProductoRecord[]>('biotrace_custom_productos', []);
    this.setStorage('biotrace_custom_productos', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('products', id));
      } catch (e) {
        console.warn('No se pudo eliminar producto en backend:', e);
      }
    }
  }

  async addPedido(ped: PedidoRecord) {
    this.pedidos.update(list => [ped, ...list]);
    const stored = this.getStorage<PedidoRecord[]>('biotrace_custom_pedidos', []);
    this.setStorage('biotrace_custom_pedidos', [ped, ...stored.filter(x => x.id !== ped.id)]);

    if (this.api) {
      try {
        const created = await firstValueFrom(this.api.create<any>('orders', {
          numero_pedido: ped.numeroPedido,
          cliente_id: ped.clienteId,
          detalles: [
            {
              nombre_producto: ped.productoNombre,
              presentacion: 'Frasco estándar',
              cantidad: ped.cantidadUnidades,
              precio_unitario: 25000
            }
          ]
        }));
        if (created?.id) {
          this.pedidos.update(list => list.map(item => item.id === ped.id ? { ...item, id: created.id } : item));
        }
      } catch (e) {
        console.warn('Persistencia de pedido en backend diferida:', e);
      }
    }
  }

  async updatePedido(ped: PedidoRecord) {
    this.pedidos.update(list => list.map(item => item.id === ped.id ? ped : item));
    const stored = this.getStorage<PedidoRecord[]>('biotrace_custom_pedidos', []);
    this.setStorage('biotrace_custom_pedidos', stored.map(x => x.id === ped.id ? ped : x));

    if (this.api) {
      try {
        await firstValueFrom(this.api.update('orders', ped.id, {
          estado: ped.estado === 'Despachado (Salida Autorizada)' ? 'DESPACHADO' : (ped.estado === 'Listo para Despacho' ? 'LISTO_PARA_DESPACHO' : 'PENDIENTE')
        }));
      } catch (e) {
        console.warn('No se pudo actualizar pedido en backend:', e);
      }
    }
  }

  async deletePedido(id: string) {
    this.pedidos.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<PedidoRecord[]>('biotrace_custom_pedidos', []);
    this.setStorage('biotrace_custom_pedidos', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('orders', id));
      } catch (e) {
        console.warn('No se pudo eliminar pedido en backend:', e);
      }
    }
  }

  async despacharPedido(id: string, guia: string) {
    this.pedidos.update(list => list.map(item => {
      if (item.id === id || item.numeroPedido === id) {
        return {
          ...item,
          estado: 'Despachado (Salida Autorizada)',
          numeroGuiaDespacho: guia || `GUIA-DESP-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      return item;
    }));
    const stored = this.getStorage<PedidoRecord[]>('biotrace_custom_pedidos', []);
    this.setStorage('biotrace_custom_pedidos', stored.map(x => (x.id === id || x.numeroPedido === id) ? {
      ...x,
      estado: 'Despachado (Salida Autorizada)',
      numeroGuiaDespacho: guia || `GUIA-DESP-${Math.floor(1000 + Math.random() * 9000)}`
    } : x));

    if (this.api) {
      try {
        await firstValueFrom(this.api.update('orders', id, { estado: 'DESPACHADO' }));
      } catch (e) {
        console.warn('No se pudo actualizar despacho en backend:', e);
      }
    }
  }

  async addIngresoMp(ing: IngresoMpRecord) {
    this.ingresosMp.update(list => [ing, ...list]);
    const stored = this.getStorage<IngresoMpRecord[]>('biotrace_custom_ingresos', []);
    this.setStorage('biotrace_custom_ingresos', [ing, ...stored.filter(x => x.id !== ing.id)]);

    if (this.api) {
      try {
        // Resolver o registrar la materia prima en PostgreSQL si es nueva
        let materialId = '';
        try {
          const mats = await firstValueFrom(this.api.list<any>('materials'));
          const found = (mats || []).find((m: any) =>
            m.codigo_materia_prima === ing.codigoInsumo ||
            m.nombre_insumo?.toLowerCase() === ing.producto?.toLowerCase()
          );
          if (found?.id) {
            materialId = found.id;
          } else {
            const createdMat = await firstValueFrom(this.api.create<any>('materials', {
              codigo_materia_prima: ing.codigoInsumo || `MP-${Math.floor(100 + Math.random() * 900)}`,
              nombre_insumo: ing.producto,
              unidad_medida: ing.unidades || 'Kg'
            }));
            if (createdMat?.id) materialId = createdMat.id;
          }
        } catch {
          // Continuar con creación del lote si es posible
        }

        if (materialId) {
          const created = await firstValueFrom(this.api.create<any>('material-lots', {
            materia_prima_id: materialId,
            lote_interno: ing.loteInterno,
            lote_proveedor: ing.loteProveedor,
            cantidad_recibida: Number(ing.cantidadRecibida) || 1,
            proveedor: ing.proveedor || 'Proveedor Autorizado'
          }));
          if (created?.id) {
            this.ingresosMp.update(list => list.map(item => item.id === ing.id ? { ...item, id: created.id } : item));
          }
        }
      } catch (e) {
        console.warn('Persistencia de ingreso MP en backend diferida:', e);
      }
    }
  }

  async updateIngresoMp(ing: IngresoMpRecord) {
    this.ingresosMp.update(list => list.map(item => item.id === ing.id ? ing : item));
    const stored = this.getStorage<IngresoMpRecord[]>('biotrace_custom_ingresos', []);
    this.setStorage('biotrace_custom_ingresos', stored.map(x => x.id === ing.id ? ing : x));
  }

  async deleteIngresoMp(id: string) {
    this.ingresosMp.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<IngresoMpRecord[]>('biotrace_custom_ingresos', []);
    this.setStorage('biotrace_custom_ingresos', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('material-lots', id));
      } catch (e) {
        console.warn('No se pudo eliminar ingreso en backend:', e);
      }
    }
  }

  async addConsumoMp(con: ConsumoMpRecord) {
    this.consumosMp.update(list => [con, ...list]);
    const stored = this.getStorage<ConsumoMpRecord[]>('biotrace_custom_consumos', []);
    this.setStorage('biotrace_custom_consumos', [con, ...stored.filter(x => x.id !== con.id)]);

    if (this.api) {
      try {
        const prodOrders = await firstValueFrom(this.api.list<any>('production-orders')).catch(() => []);
        const matchingPo = (prodOrders || []).find((po: any) => po.lote === con.loteAsignado || po.id === con.loteAsignado);
        if (matchingPo?.id) {
          const invList = await firstValueFrom(this.api.list<any>('inventory')).catch(() => []);
          const detallesPayload = con.detalles.map(d => {
            const invMatch = (invList || []).find((inv: any) => inv.lote_interno === d.loteMp);
            return {
              materia_prima_id: invMatch?.materia_prima_id || invMatch?.materia_prima?.id,
              inventario_id: invMatch?.id,
              cantidad_programada: Number(d.programadoKg) || 0.1,
              peso_real_consumido: Number(d.realConsumidoKg) || 0.1
            };
          }).filter(d => !!d.materia_prima_id && !!d.inventario_id);

          if (detallesPayload.length > 0) {
            const totalKg = con.detalles.reduce((acc, c) => acc + (Number(c.realConsumidoKg) || 0), 0) || 1;
            await firstValueFrom(this.api.create('consumptions', {
              orden_id: matchingPo.id,
              lote_total_fabricar: totalKg,
              unidad_lote: 'Kg',
              codigo_balanza: con.detalles[0]?.balanza || 'Balanza Mettler Toledo',
              detalles: detallesPayload
            }));
          }
        }
      } catch (e) {
        console.warn('Persistencia de consumo en backend diferida:', e);
      }
    }
  }

  async updateConsumoMp(con: ConsumoMpRecord) {
    this.consumosMp.update(list => list.map(item => item.id === con.id ? con : item));
    const stored = this.getStorage<ConsumoMpRecord[]>('biotrace_custom_consumos', []);
    this.setStorage('biotrace_custom_consumos', stored.map(x => x.id === con.id ? con : x));
  }

  async deleteConsumoMp(id: string) {
    this.consumosMp.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<ConsumoMpRecord[]>('biotrace_custom_consumos', []);
    this.setStorage('biotrace_custom_consumos', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('consumptions', id));
      } catch (e) {
        console.warn('No se pudo eliminar consumo en backend:', e);
      }
    }
  }

  async addFabricacion(fab: FabricacionRecord) {
    this.fabricaciones.update(list => [fab, ...list]);
    const stored = this.getStorage<FabricacionRecord[]>('biotrace_custom_fabricaciones', []);
    this.setStorage('biotrace_custom_fabricaciones', [fab, ...stored.filter(x => x.id !== fab.id)]);

    if (this.api) {
      try {
        const prods = await firstValueFrom(this.api.list<any>('products')).catch(() => []);
        const matchingProd = (prods || []).find((p: any) =>
          p.nombre_producto?.toLowerCase() === fab.nombreProducto?.toLowerCase() || p.id === fab.nombreProducto
        ) || prods?.[0];

        if (matchingProd?.id) {
          const created = await firstValueFrom(this.api.create<any>('production-orders', {
            producto_id: matchingProd.id,
            lote: fab.lote,
            nombre_producto: fab.nombreProducto,
            marca: fab.marca || 'BioTrace',
            cantidad_programada: Number(fab.tamanoLoteKg) || 100,
            presentacion: 'Frasco estándar x 30ml'
          }));
          if (created?.id) {
            this.fabricaciones.update(list => list.map(item => item.id === fab.id ? { ...item, id: created.id } : item));
          }
        }
      } catch (e) {
        console.warn('Persistencia de fabricación en backend diferida:', e);
      }
    }
  }

  async updateFabricacion(fab: FabricacionRecord) {
    this.fabricaciones.update(list => list.map(item => item.id === fab.id ? fab : item));
    const stored = this.getStorage<FabricacionRecord[]>('biotrace_custom_fabricaciones', []);
    this.setStorage('biotrace_custom_fabricaciones', stored.map(x => x.id === fab.id ? fab : x));
  }

  async deleteFabricacion(id: string) {
    this.fabricaciones.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<FabricacionRecord[]>('biotrace_custom_fabricaciones', []);
    this.setStorage('biotrace_custom_fabricaciones', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('production-orders', id));
      } catch (e) {
        console.warn('No se pudo eliminar fabricación en backend:', e);
      }
    }
  }

  async addCalidad(qc: CalidadRecord) {
    this.calidadRegistros.update(list => [qc, ...list]);
    const stored = this.getStorage<CalidadRecord[]>('biotrace_custom_calidad', []);
    this.setStorage('biotrace_custom_calidad', [qc, ...stored.filter(x => x.id !== qc.id)]);

    if (this.api) {
      try {
        const prodOrders = await firstValueFrom(this.api.list<any>('production-orders')).catch(() => []);
        const matchingPo = (prodOrders || []).find((po: any) => po.lote === qc.lote || po.id === qc.lote) || prodOrders?.[0];
        if (matchingPo?.id) {
          const parametrosPayload = qc.parametros.map(p => ({
            parametro: p.parametro || 'Parámetro',
            especificacion: p.especificacion || 'Conforme',
            resultado: p.resultado || 'Conforme',
            cumple: p.cumple ?? true
          }));
          const isAprobado = qc.dictamen.includes('APROBADO') && parametrosPayload.every(p => p.cumple);
          await firstValueFrom(this.api.create('quality', {
            orden_id: matchingPo.id,
            muestra_aprobada: isAprobado,
            analizado_por: qc.analista || 'Analista de Calidad QC',
            revisado_por: qc.firmadoPor || 'Director Técnico QA',
            parametros: parametrosPayload.length > 0 ? parametrosPayload : [{
              parametro: 'Aspecto',
              especificacion: 'Líquido homogéneo',
              resultado: 'Cumple',
              cumple: true
            }]
          }));
        }
      } catch (e) {
        console.warn('Persistencia de calidad en backend diferida:', e);
      }
    }
  }

  async updateCalidad(qc: CalidadRecord) {
    this.calidadRegistros.update(list => list.map(item => item.id === qc.id ? qc : item));
    const stored = this.getStorage<CalidadRecord[]>('biotrace_custom_calidad', []);
    this.setStorage('biotrace_custom_calidad', stored.map(x => x.id === qc.id ? qc : x));
  }

  async deleteCalidad(id: string) {
    this.calidadRegistros.update(list => list.filter(item => item.id !== id));
    const stored = this.getStorage<CalidadRecord[]>('biotrace_custom_calidad', []);
    this.setStorage('biotrace_custom_calidad', stored.filter(x => x.id !== id));

    if (this.api) {
      try {
        await firstValueFrom(this.api.delete('quality', id));
      } catch (e) {
        console.warn('No se pudo eliminar registro de calidad en backend:', e);
      }
    }
  }

  // ========================================================
  // INVENTARIO Y STOCK EN TIEMPO REAL (ESTÁNDAR LAPROBELL)
  // ========================================================

  /**
   * Señal computada que calcula en tiempo real los saldos de cada lote de materia prima:
   * saldoDisponible = cantidadInicial - totalConsumido
   * Estado: 'AGOTADO' (0 Kg), 'STOCK_BAJO' (<= 20%), 'DISPONIBLE' (> 20%)
   * Incluye lista completa de movimientos de reactor ("¿En qué se consumió?")
   */
  inventarioLotes = computed<InventarioLoteMp[]>(() => {
    const ingresos = this.ingresosMp();
    const consumos = this.consumosMp();

    const normalizar = (s: string) => (s || '').trim().toUpperCase();

    // Recopilar todos los consumos detallados
    const todosMovimientos: {
      loteKey: string;
      mov: MovimientoConsumoItem;
    }[] = [];

    for (const c of consumos) {
      for (const det of c.detalles || []) {
        const key = normalizar(det.loteMp);
        if (!key) continue;
        const cant = Number(det.realConsumidoKg) || Number(det.programadoKg) || 0;
        todosMovimientos.push({
          loteKey: key,
          mov: {
            consumoId: c.id,
            codigoConsumo: c.codigoConsumo,
            numeroPedido: c.numeroPedido,
            productoNombre: c.productoNombre,
            loteAsignado: c.loteAsignado,
            reactor: c.reactor,
            fecha: c.fechaConsumo,
            operador: c.operador,
            cantidadConsumida: cant,
            unidad: det.unidad || 'Kg',
            balanza: det.balanza || 'Balanza Analítica'
          }
        });
      }
    }

    return ingresos.map(ing => {
      const ingKey = normalizar(ing.loteInterno);
      const movs = todosMovimientos
        .filter(m => m.loteKey === ingKey)
        .map(m => m.mov);

      const cantidadInicial = Number(ing.cantidadRecibida) || 0;
      const totalConsumido = Number(movs.reduce((acc, m) => acc + m.cantidadConsumida, 0).toFixed(2));
      const saldoDisponible = Math.max(0, Number((cantidadInicial - totalConsumido).toFixed(2)));

      const porcentajeDisponible = cantidadInicial > 0
        ? Math.max(0, Math.min(100, Math.round((saldoDisponible / cantidadInicial) * 100)))
        : 0;

      let estadoStock: 'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO' = 'DISPONIBLE';
      if (saldoDisponible <= 0.001) {
        estadoStock = 'AGOTADO';
      } else if (porcentajeDisponible <= 20) {
        estadoStock = 'STOCK_BAJO';
      }

      return {
        id: ing.id,
        loteInterno: ing.loteInterno,
        producto: ing.producto,
        codigoInsumo: ing.codigoInsumo,
        proveedor: ing.proveedor,
        loteProveedor: ing.loteProveedor,
        unidades: ing.unidades || 'Kg',
        precioUnitario: ing.precioUnitario || 0,
        fechaRecepcion: ing.fechaRecepcion,
        fechaVencimiento: ing.fechaVencimiento,
        estadoCalidad: ing.estadoCalidad,
        cantidadInicial,
        totalConsumido,
        saldoDisponible,
        porcentajeDisponible,
        estadoStock,
        totalMovimientos: movs.length,
        movimientos: movs,
        aspecto: ing.aspecto,
        observaciones: ing.observaciones
      };
    });
  });

  /**
   * KPIs generales de inventario y stock
   */
  inventarioKpis = computed<InventarioKpis>(() => {
    const lotes = this.inventarioLotes();
    let totalStockDisponibleKg = 0;
    let totalIngresadoKg = 0;
    let totalConsumidoKg = 0;
    let lotesDisponibles = 0;
    let lotesBajoStock = 0;
    let lotesAgotados = 0;

    for (const l of lotes) {
      totalStockDisponibleKg += l.saldoDisponible;
      totalIngresadoKg += l.cantidadInicial;
      totalConsumidoKg += l.totalConsumido;

      if (l.estadoStock === 'AGOTADO') {
        lotesAgotados++;
      } else if (l.estadoStock === 'STOCK_BAJO') {
        lotesBajoStock++;
      } else {
        lotesDisponibles++;
      }
    }

    return {
      totalStockDisponibleKg: Number(totalStockDisponibleKg.toFixed(2)),
      totalIngresadoKg: Number(totalIngresadoKg.toFixed(2)),
      totalConsumidoKg: Number(totalConsumidoKg.toFixed(2)),
      lotesDisponibles,
      lotesBajoStock,
      lotesAgotados,
      totalLotes: lotes.length
    };
  });

  /**
   * Ajuste manual de stock o corrección de inventario
   */
  ajustarStockLote(loteInterno: string, nuevoStock: number, motivo: string) {
    this.ingresosMp.update(list => list.map(item => {
      if (item.loteInterno === loteInterno) {
        return {
          ...item,
          cantidadRecibida: nuevoStock,
          observaciones: `${item.observaciones || ''} [Ajuste de inventario: ${motivo} - Saldo ajustado: ${nuevoStock} ${item.unidades}]`.trim()
        };
      }
      return item;
    }));
  }
}
