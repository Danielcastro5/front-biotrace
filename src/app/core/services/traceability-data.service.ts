import { Injectable, signal } from '@angular/core';

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
  // 1. CLIENTES COHERENTES
  clientes = signal<ClienteRecord[]>([
    {
      id: 'CLI-001',
      codigo: 'CLI-MED-01',
      razonSocial: 'Dermocosmética San Ángel S.A.S.',
      nit: '900.542.110-3',
      contacto: 'Dr. Roberto Gómez (Director Compras)',
      correo: 'compras@dermosanangel.com',
      telefono: '+57 (4) 448-9210',
      ciudad: 'Medellín, Antioquia',
      direccion: 'Cra 43A # 18 Sur - 125, El Poblado',
      categoria: 'Cliente Magistral VIP',
      estado: 'Activo'
    },
    {
      id: 'CLI-002',
      codigo: 'CLI-BOG-02',
      razonSocial: 'Distribuidora Belleza & Salud Farma S.A.',
      nit: '860.034.921-8',
      contacto: 'Lic. Camila Ortiz (Jefe Abastecimiento)',
      correo: 'cortiz@bellezaysaludfarma.co',
      telefono: '+57 (1) 745-3300',
      ciudad: 'Bogotá D.C.',
      direccion: 'Av. Calle 26 # 69D - 91, Salitre',
      categoria: 'Distribuidor Nacional',
      estado: 'Activo'
    },
    {
      id: 'CLI-003',
      codigo: 'CLI-CAL-03',
      razonSocial: 'Laboratorios DermaPiel Ltda.',
      nit: '901.128.455-2',
      contacto: 'Dr. Andrés Cárdenas (Regente Farmacia)',
      correo: 'direcciontecnica@dermapiel.com.co',
      telefono: '+57 (2) 660-8420',
      ciudad: 'Cali, Valle del Cauca',
      direccion: 'Calle 10 # 32 - 45, San Fernando',
      categoria: 'Cadena de Clínicas',
      estado: 'Activo'
    }
  ]);

  // 2. PRODUCTOS COHERENTES CON FÓRMULAS GALÉNICAS
  productos = signal<ProductoRecord[]>([
    {
      id: 'PRD-001',
      codigo: 'PRD-SER-01',
      nombre: 'Sérum Facial Ácido Hialurónico 2%',
      linea: 'BioTrace Derma Care',
      presentacion: 'Frasco gotero de vidrio ámbar x 30 ml',
      registroInvima: 'NSOC94210-26CO',
      tamanoLoteEstandar: 150, // Kg
      formula: [
        { codigoMateriaPrima: 'MP-HA-01', nombreMateriaPrima: 'Ácido Hialurónico Puro 99% (Sodio Hialuronato)', loteSugerido: 'LOT-MP-HA-101', porcentaje: 2.0, cantidadPorLote: 3.0, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-AG-02', nombreMateriaPrima: 'Agua Desionizada Purificada Grado USP', loteSugerido: 'LOT-MP-AG-205', porcentaje: 95.0, cantidadPorLote: 142.5, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-GL-03', nombreMateriaPrima: 'Glicerina Vegetal USP 99.5%', loteSugerido: 'LOT-MP-GL-302', porcentaje: 3.0, cantidadPorLote: 4.5, unidad: 'Kg' }
      ],
      estado: 'Activo'
    },
    {
      id: 'PRD-002',
      codigo: 'PRD-CRM-02',
      nombre: 'Crema Hidratante Ceramid-5 Ultra',
      linea: 'BioTrace Barrier Repair',
      presentacion: 'Pote cosmético sellado al vacío x 50 g',
      registroInvima: 'NSOC88124-25CO',
      tamanoLoteEstandar: 150, // Kg
      formula: [
        { codigoMateriaPrima: 'MP-CR-04', nombreMateriaPrima: 'Complejo Ceramidas Lipídicas (EOP, NP, AP)', loteSugerido: 'LOT-MP-CR-404', porcentaje: 3.0, cantidadPorLote: 4.5, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-MK-05', nombreMateriaPrima: 'Manteca de Karité Refinada Grado Cosmético', loteSugerido: 'LOT-MP-MK-505', porcentaje: 10.0, cantidadPorLote: 15.0, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-AG-02', nombreMateriaPrima: 'Agua Desionizada Purificada Grado USP', loteSugerido: 'LOT-MP-AG-205', porcentaje: 87.0, cantidadPorLote: 130.5, unidad: 'Kg' }
      ],
      estado: 'Activo'
    },
    {
      id: 'PRD-003',
      codigo: 'PRD-TON-03',
      nombre: 'Tónico Facial Botánico Calmante',
      linea: 'BioTrace Natural Solutions',
      presentacion: 'Frasco pulverizador con atomizador x 200 ml',
      registroInvima: 'NSOC76319-24CO',
      tamanoLoteEstandar: 100, // Kg
      formula: [
        { codigoMateriaPrima: 'MP-HB-06', nombreMateriaPrima: 'Extracto Botánico de Hamamelis y Caléndula', loteSugerido: 'LOT-MP-HA-606', porcentaje: 10.0, cantidadPorLote: 10.0, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-NI-07', nombreMateriaPrima: 'Niacinamida Pura USP (Vitamina B3)', loteSugerido: 'LOT-MP-NI-707', porcentaje: 4.0, cantidadPorLote: 4.0, unidad: 'Kg' },
        { codigoMateriaPrima: 'MP-AG-02', nombreMateriaPrima: 'Agua Desionizada Purificada Grado USP', loteSugerido: 'LOT-MP-AG-205', porcentaje: 86.0, cantidadPorLote: 86.0, unidad: 'Kg' }
      ],
      estado: 'Activo'
    }
  ]);

  // 3. PEDIDOS COHERENTES (PUNTO 1 DE LA CADENA)
  pedidos = signal<PedidoRecord[]>([
    {
      id: 'PED-001',
      numeroPedido: 'PED-2026-001',
      clienteId: 'CLI-001',
      clienteNombre: 'Dermocosmética San Ángel S.A.S.',
      productoId: 'PRD-001',
      productoNombre: 'Sérum Facial Ácido Hialurónico 2%',
      loteAsignado: 'LOT-SH-2026-001',
      cantidadUnidades: 5000,
      tamanoLoteKg: 150,
      fechaPedido: '2026-05-02',
      fechaEntregaRequerida: '2026-05-15',
      estado: 'Despachado (Salida Autorizada)',
      numeroGuiaDespacho: 'GUIA-SERVI-2026-8812',
      observaciones: 'Lote completo liberado por QA y despachado con remisión técnica y COA impreso.'
    },
    {
      id: 'PED-002',
      numeroPedido: 'PED-2026-002',
      clienteId: 'CLI-002',
      clienteNombre: 'Distribuidora Belleza & Salud Farma S.A.',
      productoId: 'PRD-002',
      productoNombre: 'Crema Hidratante Ceramid-5 Ultra',
      loteAsignado: 'LOT-CR-2026-015',
      cantidadUnidades: 3000,
      tamanoLoteKg: 150,
      fechaPedido: '2026-05-03',
      fechaEntregaRequerida: '2026-05-18',
      estado: 'Despachado (Salida Autorizada)',
      numeroGuiaDespacho: 'GUIA-TCC-2026-4402',
      observaciones: 'Embalaje con control térmico. Despacho conforme según solicitud del distribuidor.'
    },
    {
      id: 'PED-003',
      numeroPedido: 'PED-2026-003',
      clienteId: 'CLI-003',
      clienteNombre: 'Laboratorios DermaPiel Ltda.',
      productoId: 'PRD-003',
      productoNombre: 'Tónico Facial Botánico Calmante',
      loteAsignado: 'LOT-TG-2026-042',
      cantidadUnidades: 2000,
      tamanoLoteKg: 100,
      fechaPedido: '2026-05-05',
      fechaEntregaRequerida: '2026-05-20',
      estado: 'Listo para Despacho',
      numeroGuiaDespacho: undefined,
      observaciones: 'Inspección de calidad completada. Pendiente programación de camión de reparto.'
    }
  ]);

  // 4. INGRESOS DE MATERIA PRIMA (ORIGEN DE INSUMOS)
  ingresosMp = signal<IngresoMpRecord[]>([
    {
      id: 'ING-001',
      loteInterno: 'LOT-MP-HA-101',
      producto: 'Ácido Hialurónico Puro 99% (Sodio Hialuronato)',
      codigoInsumo: 'MP-HA-01',
      proveedor: 'Solchem Biochem International',
      loteProveedor: 'HA-EU-884',
      cantidadRecibida: 25.0,
      unidades: 'Kg',
      precioUnitario: 420000,
      costoTotal: 10500000,
      fechaRecepcion: '2026-04-18',
      fechaVencimiento: '2028-04-18',
      estadoCalidad: 'Aprobado',
      coaArchivo: 'COA-SOL-884-HA.pdf',
      liberadoPor: 'Dra. Elena Ramírez (QA Chief)',
      aspecto: 'Polvo microcristalino blanco inodoro',
      observaciones: 'Pureza del 99.4% analizada por HPLC. Apto para formulación magistral.'
    },
    {
      id: 'ING-002',
      loteInterno: 'LOT-MP-CR-404',
      producto: 'Complejo Ceramidas Lipídicas (EOP, NP, AP)',
      codigoInsumo: 'MP-CR-04',
      proveedor: 'Evonik Pharma Specialties',
      loteProveedor: 'CR-GER-512',
      cantidadRecibida: 50.0,
      unidades: 'Kg',
      precioUnitario: 280000,
      costoTotal: 14000000,
      fechaRecepcion: '2026-04-20',
      fechaVencimiento: '2028-04-20',
      estadoCalidad: 'Aprobado',
      coaArchivo: 'COA-EVO-512-CER.pdf',
      liberadoPor: 'Dr. Julián Vélez (QC Lab)',
      aspecto: 'Líquido pastoso céreo marfil',
      observaciones: 'Certificado de libre de solventes residuales y metales pesados conforme.'
    },
    {
      id: 'ING-003',
      loteInterno: 'LOT-MP-HA-606',
      producto: 'Extracto Botánico de Hamamelis y Caléndula',
      codigoInsumo: 'MP-HB-06',
      proveedor: 'Fitobotanica Lab Colombia',
      loteProveedor: 'HB-COL-230',
      cantidadRecibida: 40.0,
      unidades: 'Kg',
      precioUnitario: 95000,
      costoTotal: 3800000,
      fechaRecepcion: '2026-04-22',
      fechaVencimiento: '2027-10-22',
      estadoCalidad: 'Aprobado',
      coaArchivo: 'COA-FIT-230-BOT.pdf',
      liberadoPor: 'Dra. María Restrepo (Dirección)',
      aspecto: 'Líquido límpido ámbar claro con aroma herbal',
      observaciones: 'Extracto hidro-glicólico estandarizado en flavonoides totales.'
    },
    {
      id: 'ING-004',
      loteInterno: 'LOT-MP-AG-205',
      producto: 'Agua Desionizada Purificada Grado USP',
      codigoInsumo: 'MP-AG-02',
      proveedor: 'Acuabio Planta Central',
      loteProveedor: 'AG-MED-205',
      cantidadRecibida: 1000.0,
      unidades: 'L',
      precioUnitario: 1200,
      costoTotal: 1200000,
      fechaRecepcion: '2026-05-01',
      fechaVencimiento: '2026-06-01',
      estadoCalidad: 'Aprobado',
      coaArchivo: 'COA-AG-205-USP.pdf',
      liberadoPor: 'Carlos Mendoza (Operador)',
      aspecto: 'Líquido incoloro conductividad < 1.3 uS/cm',
      observaciones: 'Generada por ósmosis inversa de doble paso con esterilización UV.'
    },
    {
      id: 'ING-005',
      loteInterno: 'LOT-MP-GL-302',
      producto: 'Glicerina Vegetal USP 99.5%',
      codigoInsumo: 'MP-GL-03',
      proveedor: 'Glicerol Chem S.A.S.',
      loteProveedor: 'GL-USP-991',
      cantidadRecibida: 200.0,
      unidades: 'Kg',
      precioUnitario: 18500,
      costoTotal: 3700000,
      fechaRecepcion: '2026-04-25',
      fechaVencimiento: '2028-04-25',
      estadoCalidad: 'Aprobado',
      coaArchivo: 'COA-GL-991-USP.pdf',
      liberadoPor: 'Dr. Julián Vélez (QC Lab)',
      aspecto: 'Líquido viscoso incoloro de sabor dulce',
      observaciones: 'Grado farmacopea europea y USP alimenticio.'
    }
  ]);

  // 5. CONSUMOS EN REACTORES (VINCULADOS A PEDIDOS)
  consumosMp = signal<ConsumoMpRecord[]>([
    {
      id: 'CON-001',
      codigoConsumo: 'CON-2026-001',
      numeroPedido: 'PED-2026-001',
      clienteNombre: 'Dermocosmética San Ángel S.A.S.',
      productoNombre: 'Sérum Facial Ácido Hialurónico 2%',
      loteAsignado: 'LOT-SH-2026-001',
      reactor: 'Reactor R-101 (Inox 500L)',
      fechaConsumo: '2026-05-06',
      operador: 'Carlos Mendoza',
      detalles: [
        { materiaPrima: 'Ácido Hialurónico Puro 99%', loteMp: 'LOT-MP-HA-101', programadoKg: 3.0, realConsumidoKg: 3.0, unidad: 'Kg', balanza: 'Balanza Analítica Mettler Toledo (Calib #04)' },
        { materiaPrima: 'Agua Desionizada Purificada USP', loteMp: 'LOT-MP-AG-205', programadoKg: 142.5, realConsumidoKg: 142.5, unidad: 'Kg', balanza: 'Báscula Plataforma Inox 500Kg' },
        { materiaPrima: 'Glicerina Vegetal USP 99.5%', loteMp: 'LOT-MP-GL-302', programadoKg: 4.5, realConsumidoKg: 4.5, unidad: 'Kg', balanza: 'Balanza Precisión Sartorius' }
      ],
      estado: 'Conforme',
      observaciones: 'Pesada estricta verificada con doble visto bueno. Balance atómico sin merma.'
    },
    {
      id: 'CON-002',
      codigoConsumo: 'CON-2026-002',
      numeroPedido: 'PED-2026-002',
      clienteNombre: 'Distribuidora Belleza & Salud Farma S.A.',
      productoNombre: 'Crema Hidratante Ceramid-5 Ultra',
      loteAsignado: 'LOT-CR-2026-015',
      reactor: 'Reactor R-102 (Inox 250L)',
      fechaConsumo: '2026-05-07',
      operador: 'Diana Suárez',
      detalles: [
        { materiaPrima: 'Complejo Ceramidas Lipídicas', loteMp: 'LOT-MP-CR-404', programadoKg: 4.5, realConsumidoKg: 4.5, unidad: 'Kg', balanza: 'Balanza Analítica Mettler Toledo' },
        { materiaPrima: 'Manteca de Karité Refinada', loteMp: 'LOT-MP-MK-505', programadoKg: 15.0, realConsumidoKg: 15.0, unidad: 'Kg', balanza: 'Báscula Plataforma Inox 500Kg' },
        { materiaPrima: 'Agua Desionizada Purificada USP', loteMp: 'LOT-MP-AG-205', programadoKg: 130.5, realConsumidoKg: 130.5, unidad: 'Kg', balanza: 'Báscula Plataforma Inox 500Kg' }
      ],
      estado: 'Conforme',
      observaciones: 'Fusión de fase oleosa previa en marmita calefactora a 70°C conforme.'
    },
    {
      id: 'CON-003',
      codigoConsumo: 'CON-2026-003',
      numeroPedido: 'PED-2026-003',
      clienteNombre: 'Laboratorios DermaPiel Ltda.',
      productoNombre: 'Tónico Facial Botánico Calmante',
      loteAsignado: 'LOT-TG-2026-042',
      reactor: 'Marmita Calefactora M-01 (100L)',
      fechaConsumo: '2026-05-09',
      operador: 'Carlos Mendoza',
      detalles: [
        { materiaPrima: 'Extracto Botánico Hamamelis', loteMp: 'LOT-MP-HA-606', programadoKg: 10.0, realConsumidoKg: 10.0, unidad: 'Kg', balanza: 'Balanza Precisión Sartorius' },
        { materiaPrima: 'Niacinamida Pura USP', loteMp: 'LOT-MP-NI-707', programadoKg: 4.0, realConsumidoKg: 4.0, unidad: 'Kg', balanza: 'Balanza Analítica Mettler Toledo' },
        { materiaPrima: 'Agua Desionizada Purificada USP', loteMp: 'LOT-MP-AG-205', programadoKg: 86.0, realConsumidoKg: 86.0, unidad: 'Kg', balanza: 'Báscula Plataforma Inox 500Kg' }
      ],
      estado: 'Conforme',
      observaciones: 'Disolución en frío completada sin turbidez ni residuos.'
    }
  ]);

  // 6. FABRICACIÓN EN PLANTA (DESPEJE 7/7 Y FASES)
  fabricaciones = signal<FabricacionRecord[]>([
    {
      id: 'FAB-001',
      lote: 'LOT-SH-2026-001',
      numeroPedido: 'PED-2026-001',
      nombreProducto: 'Sérum Facial Ácido Hialurónico 2%',
      marca: 'BioTrace Derma Care',
      reactor: 'Reactor R-101 (Inox 500L)',
      tamanoLoteKg: 150,
      fecha: '2026-05-07',
      despejeConforme: true,
      totalPasos: 3,
      operador: 'Carlos Mendoza',
      supervisor: 'Ing. Químico de Planta',
      estado: 'Completado',
      pasos: [
        { pasoNumero: 1, procedimiento: 'Carga de agua purificada grado USP e inicio de agitación suave constante.', rpm: '350 RPM', tiempo: '15 min', temperatura: '22°C', realizadoPor: 'Carlos M.' },
        { pasoNumero: 2, procedimiento: 'Adición progresiva de polímero espesante hasta completa hidratación sin grumos.', rpm: '900 RPM', tiempo: '25 min', temperatura: '22°C', realizadoPor: 'Carlos M.' },
        { pasoNumero: 3, procedimiento: 'Incorporación de Ácido Hialurónico y Glicerina en frío hasta homogenización total.', rpm: '600 RPM', tiempo: '20 min', temperatura: '23°C', realizadoPor: 'Carlos M.' }
      ],
      observaciones: 'Gel translúcido homogéneo sin burbujas de aire. Muestra enviada a laboratorio de calidad.'
    },
    {
      id: 'FAB-002',
      lote: 'LOT-CR-2026-015',
      numeroPedido: 'PED-2026-002',
      nombreProducto: 'Crema Hidratante Ceramid-5 Ultra',
      marca: 'BioTrace Barrier Repair',
      reactor: 'Reactor R-102 (Inox 250L)',
      tamanoLoteKg: 150,
      fecha: '2026-05-08',
      despejeConforme: true,
      totalPasos: 4,
      operador: 'Diana Suárez',
      supervisor: 'Ing. Químico de Planta',
      estado: 'Completado',
      pasos: [
        { pasoNumero: 1, procedimiento: 'Fase acuosa: disolución de glicerina y agua en reactor a 70°C.', rpm: '400 RPM', tiempo: '20 min', temperatura: '70°C', realizadoPor: 'Diana S.' },
        { pasoNumero: 2, procedimiento: 'Fase oleosa: fusión de manteca de karité y ceramidas en marmita auxiliar a 72°C.', rpm: '200 RPM', tiempo: '15 min', temperatura: '72°C', realizadoPor: 'Diana S.' },
        { pasoNumero: 3, procedimiento: 'Emulsificación: incorporación de fase oleosa a reactor con agitación turbo homogenizadora.', rpm: '1400 RPM', tiempo: '30 min', temperatura: '68°C', realizadoPor: 'Diana S.' },
        { pasoNumero: 4, procedimiento: 'Enfriamiento gradual hasta 35°C con agitación de palas.', rpm: '500 RPM', tiempo: '40 min', temperatura: '35°C', realizadoPor: 'Diana S.' }
      ],
      observaciones: 'Emulsión O/W blanca brillante de alta estabilidad reológica.'
    },
    {
      id: 'FAB-003',
      lote: 'LOT-TG-2026-042',
      numeroPedido: 'PED-2026-003',
      nombreProducto: 'Tónico Facial Botánico Calmante',
      marca: 'BioTrace Natural Solutions',
      reactor: 'Marmita Calefactora M-01 (100L)',
      tamanoLoteKg: 100,
      fecha: '2026-05-10',
      despejeConforme: true,
      totalPasos: 2,
      operador: 'Carlos Mendoza',
      supervisor: 'Ing. Químico de Planta',
      estado: 'Completado',
      pasos: [
        { pasoNumero: 1, procedimiento: 'Mezcla de agua desionizada con Niacinamida y extracto botánico.', rpm: '300 RPM', tiempo: '15 min', temperatura: 'Ambiente (21°C)', realizadoPor: 'Carlos M.' },
        { pasoNumero: 2, procedimiento: 'Filtración clarificante por membrana estéril de 0.45 micras hacia tanque pulmón.', rpm: 'Bomba 1.8 bar', tiempo: '20 min', temperatura: 'Ambiente', realizadoPor: 'Carlos M.' }
      ],
      observaciones: 'Solución acuosa brillante sin sedimentación ni turbidez.'
    }
  ]);

  // 7. CONTROL DE CALIDAD & CERTIFICADOS COA
  calidadRegistros = signal<CalidadRecord[]>([
    {
      id: 'QC-001',
      lote: 'LOT-SH-2026-001',
      numeroPedido: 'PED-2026-001',
      nombreProducto: 'Sérum Facial Ácido Hialurónico 2%',
      marca: 'BioTrace Derma Care',
      fecha: '2026-05-09',
      tipoMuestra: 'Granel y Muestra Piloto',
      dictamen: 'APROBADO / LIBERADO',
      analista: 'Dra. María Restrepo (QC Analista)',
      firmadoPor: 'Dra. Elena Ramírez (Dirección Técnica)',
      numeroCoa: 'COA-2026-001',
      parametros: [
        { parametro: 'Densidad a 20°C (g/mL)', especificacion: '1.010 - 1.040', resultado: '1.025', cumple: true },
        { parametro: 'pH a 25°C', especificacion: '5.50 - 6.50', resultado: '5.85', cumple: true },
        { parametro: 'Viscosidad Brookfield (cP)', especificacion: '2500 - 4500 cP (Sp 4, 20 RPM)', resultado: '3200 cP', cumple: true },
        { parametro: 'Aspecto Organoléptico', especificacion: 'Líquido viscoso homogéneo translúcido', resultado: 'Conforme', cumple: true },
        { parametro: 'Recuento Microbiológico (Mesófilos)', especificacion: '< 100 UFC/g (Sin patógenos)', resultado: '< 10 UFC/g', cumple: true }
      ],
      observaciones: 'Lote liberado formalmente para envasado y despacho comercial bajo Pedido PED-2026-001.'
    },
    {
      id: 'QC-002',
      lote: 'LOT-CR-2026-015',
      numeroPedido: 'PED-2026-002',
      nombreProducto: 'Crema Hidratante Ceramid-5 Ultra',
      marca: 'BioTrace Barrier Repair',
      fecha: '2026-05-10',
      tipoMuestra: 'Granel en reactor R-102',
      dictamen: 'APROBADO / LIBERADO',
      analista: 'Dr. Julián Vélez (QC Analista)',
      firmadoPor: 'Dra. Elena Ramírez (Dirección Técnica)',
      numeroCoa: 'COA-2026-002',
      parametros: [
        { parametro: 'Densidad a 20°C (g/mL)', especificacion: '0.980 - 1.020', resultado: '0.995', cumple: true },
        { parametro: 'pH a 25°C', especificacion: '5.00 - 6.00', resultado: '5.45', cumple: true },
        { parametro: 'Viscosidad Brookfield (cP)', especificacion: '18000 - 24000 cP (Sp 6, 10 RPM)', resultado: '21500 cP', cumple: true },
        { parametro: 'Aspecto Organoléptico', especificacion: 'Emulsión O/W blanca marfil brillante', resultado: 'Conforme', cumple: true },
        { parametro: 'Recuento Microbiológico (Mesófilos)', especificacion: '< 100 UFC/g (Sin patógenos)', resultado: 'Ausencia', cumple: true }
      ],
      observaciones: 'Prueba de centrifugación a 3000 RPM superada sin separación de fases.'
    },
    {
      id: 'QC-003',
      lote: 'LOT-TG-2026-042',
      numeroPedido: 'PED-2026-003',
      nombreProducto: 'Tónico Facial Botánico Calmante',
      marca: 'BioTrace Natural Solutions',
      fecha: '2026-05-11',
      tipoMuestra: 'Tanque pulmón post-filtración',
      dictamen: 'APROBADO / LIBERADO',
      analista: 'Dra. María Restrepo (QC Analista)',
      firmadoPor: 'Dra. Elena Ramírez (Dirección Técnica)',
      numeroCoa: 'COA-2026-003',
      parametros: [
        { parametro: 'Densidad a 20°C (g/mL)', especificacion: '1.000 - 1.015', resultado: '1.008', cumple: true },
        { parametro: 'pH a 25°C', especificacion: '5.00 - 5.60', resultado: '5.20', cumple: true },
        { parametro: 'Aspecto Organoléptico', especificacion: 'Líquido límpido ámbar claro con aroma floral', resultado: 'Conforme', cumple: true },
        { parametro: 'Recuento Microbiológico (Mesófilos)', especificacion: '< 100 UFC/g', resultado: '< 10 UFC/g', cumple: true }
      ],
      observaciones: 'Apto para llenado de frascos pulverizadores. Producto final conforme.'
    }
  ]);

  // MÉTODOS DE MUTACIÓN CON PERSISTENCIA REACTIVA
  addCliente(c: ClienteRecord) {
    this.clientes.update(list => [c, ...list]);
  }
  updateCliente(c: ClienteRecord) {
    this.clientes.update(list => list.map(item => item.id === c.id ? c : item));
  }
  deleteCliente(id: string) {
    this.clientes.update(list => list.filter(item => item.id !== id));
  }

  addProducto(p: ProductoRecord) {
    this.productos.update(list => [p, ...list]);
  }
  updateProducto(p: ProductoRecord) {
    this.productos.update(list => list.map(item => item.id === p.id ? p : item));
  }
  deleteProducto(id: string) {
    this.productos.update(list => list.filter(item => item.id !== id));
  }

  addPedido(ped: PedidoRecord) {
    this.pedidos.update(list => [ped, ...list]);
  }
  updatePedido(ped: PedidoRecord) {
    this.pedidos.update(list => list.map(item => item.id === ped.id ? ped : item));
  }
  deletePedido(id: string) {
    this.pedidos.update(list => list.filter(item => item.id !== id));
  }
  despacharPedido(id: string, guia: string) {
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
  }

  addIngresoMp(ing: IngresoMpRecord) {
    this.ingresosMp.update(list => [ing, ...list]);
  }
  updateIngresoMp(ing: IngresoMpRecord) {
    this.ingresosMp.update(list => list.map(item => item.id === ing.id ? ing : item));
  }
  deleteIngresoMp(id: string) {
    this.ingresosMp.update(list => list.filter(item => item.id !== id));
  }

  addConsumoMp(con: ConsumoMpRecord) {
    this.consumosMp.update(list => [con, ...list]);
  }
  updateConsumoMp(con: ConsumoMpRecord) {
    this.consumosMp.update(list => list.map(item => item.id === con.id ? con : item));
  }
  deleteConsumoMp(id: string) {
    this.consumosMp.update(list => list.filter(item => item.id !== id));
  }

  addFabricacion(fab: FabricacionRecord) {
    this.fabricaciones.update(list => [fab, ...list]);
  }
  updateFabricacion(fab: FabricacionRecord) {
    this.fabricaciones.update(list => list.map(item => item.id === fab.id ? fab : item));
  }
  deleteFabricacion(id: string) {
    this.fabricaciones.update(list => list.filter(item => item.id !== id));
  }

  addCalidad(qc: CalidadRecord) {
    this.calidadRegistros.update(list => [qc, ...list]);
  }
  updateCalidad(qc: CalidadRecord) {
    this.calidadRegistros.update(list => list.map(item => item.id === qc.id ? qc : item));
  }
  deleteCalidad(id: string) {
    this.calidadRegistros.update(list => list.filter(item => item.id !== id));
  }
}

