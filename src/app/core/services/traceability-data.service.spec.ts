import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { TraceabilityDataService, ConsumoMpRecord, IngresoMpRecord } from './traceability-data.service';

describe('TraceabilityDataService - Inventario y Stock', () => {
  let service: TraceabilityDataService;

  beforeEach(() => {
    service = new TraceabilityDataService();

    // Semilla de prueba para aislamiento unitario en Vitest
    service.ingresosMp.set([
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
        id: 'ING-006',
        loteInterno: 'LOT-MP-NI-707',
        producto: 'Niacinamida Pura USP (Vitamina B3)',
        codigoInsumo: 'MP-NI-07',
        proveedor: 'Lonza Specialties Inc.',
        loteProveedor: 'NI-CH-774',
        cantidadRecibida: 5.0,
        unidades: 'Kg',
        precioUnitario: 310000,
        costoTotal: 1550000,
        fechaRecepcion: '2026-05-02',
        fechaVencimiento: '2028-05-02',
        estadoCalidad: 'Aprobado',
        coaArchivo: 'COA-LON-774-NIA.pdf',
        liberadoPor: 'Dra. Elena Ramírez (QA Chief)',
        aspecto: 'Polvo blanco cristalino',
        observaciones: 'Activo dermocosmético concentrado.'
      },
      {
        id: 'ING-008',
        loteInterno: 'LOT-MP-COL-101',
        producto: 'Colágeno Marino Hidrolizado USP',
        codigoInsumo: 'MP-COL-08',
        proveedor: 'Rousselot Peptan France',
        loteProveedor: 'COL-FR-110',
        cantidadRecibida: 10.0,
        unidades: 'Kg',
        precioUnitario: 290000,
        costoTotal: 2900000,
        fechaRecepcion: '2026-04-10',
        fechaVencimiento: '2028-04-10',
        estadoCalidad: 'Aprobado',
        coaArchivo: 'COA-ROU-110-COL.pdf',
        liberadoPor: 'Dr. Julián Vélez (QC Lab)',
        aspecto: 'Polvo fino crema',
        observaciones: 'Lote piloto.'
      }
    ]);

    service.consumosMp.set([
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
          { materiaPrima: 'Ácido Hialurónico Puro 99%', loteMp: 'LOT-MP-HA-101', programadoKg: 3.0, realConsumidoKg: 3.0, unidad: 'Kg', balanza: 'Balanza Mettler' }
        ],
        estado: 'Conforme',
        observaciones: 'Pesada estricta verificada.'
      },
      {
        id: 'CON-003',
        codigoConsumo: 'CON-2026-003',
        numeroPedido: 'PED-2026-003',
        clienteNombre: 'Laboratorios DermaPiel Ltda.',
        productoNombre: 'Tónico Facial Botánico Calmante',
        loteAsignado: 'LOT-TG-2026-042',
        reactor: 'Marmita M-01',
        fechaConsumo: '2026-05-09',
        operador: 'Carlos Mendoza',
        detalles: [
          { materiaPrima: 'Niacinamida Pura USP', loteMp: 'LOT-MP-NI-707', programadoKg: 4.0, realConsumidoKg: 4.0, unidad: 'Kg', balanza: 'Balanza Mettler' }
        ],
        estado: 'Conforme',
        observaciones: 'Consumo conforme.'
      },
      {
        id: 'CON-004',
        codigoConsumo: 'CON-2026-004',
        numeroPedido: 'PED-PILOTO',
        clienteNombre: 'Producción Interna',
        productoNombre: 'Complejo Colágeno',
        loteAsignado: 'LOT-PIL-099',
        reactor: 'Reactor R-101',
        fechaConsumo: '2026-05-04',
        operador: 'Carlos Mendoza',
        detalles: [
          { materiaPrima: 'Colágeno Marino', loteMp: 'LOT-MP-COL-101', programadoKg: 10.0, realConsumidoKg: 10.0, unidad: 'Kg', balanza: 'Balanza Mettler' }
        ],
        estado: 'Conforme',
        observaciones: 'Consumo total de lote.'
      }
    ]);
  });

  it('debe calcular correctamente los saldos de inventario desde ingresos y consumos', () => {
    const lotes = service.inventarioLotes();
    expect(lotes.length).toBeGreaterThan(0);

    const loteHA = lotes.find(l => l.loteInterno === 'LOT-MP-HA-101');
    expect(loteHA).toBeDefined();
    // 25.0 inicial - 3.0 consumido = 22.0
    expect(loteHA?.cantidadInicial).toBe(25.0);
    expect(loteHA?.totalConsumido).toBe(3.0);
    expect(loteHA?.saldoDisponible).toBe(22.0);
    expect(loteHA?.estadoStock).toBe('DISPONIBLE');
  });

  it('debe clasificar como STOCK_BAJO los lotes con saldo <= 20% e > 0', () => {
    const lotes = service.inventarioLotes();
    const loteNiacinamida = lotes.find(l => l.loteInterno === 'LOT-MP-NI-707');
    expect(loteNiacinamida).toBeDefined();
    // 5.0 inicial - 4.0 consumido = 1.0 (20%)
    expect(loteNiacinamida?.saldoDisponible).toBe(1.0);
    expect(loteNiacinamida?.porcentajeDisponible).toBe(20);
    expect(loteNiacinamida?.estadoStock).toBe('STOCK_BAJO');
  });

  it('debe clasificar como AGOTADO los lotes con saldo 0', () => {
    const lotes = service.inventarioLotes();
    const loteColageno = lotes.find(l => l.loteInterno === 'LOT-MP-COL-101');
    expect(loteColageno).toBeDefined();
    expect(loteColageno?.saldoDisponible).toBe(0);
    expect(loteColageno?.estadoStock).toBe('AGOTADO');
  });

  it('debe descontar el stock reactivamente al registrar un nuevo consumo', () => {
    const antes = service.inventarioLotes().find(l => l.loteInterno === 'LOT-MP-HA-101');
    const saldoAntes = antes?.saldoDisponible || 0;

    const nuevoConsumo: ConsumoMpRecord = {
      id: 'CON-TEST-99',
      codigoConsumo: 'CON-2026-999',
      numeroPedido: 'PED-TEST',
      clienteNombre: 'Cliente Test',
      productoNombre: 'Producto Test',
      loteAsignado: 'LOT-TEST-99',
      reactor: 'Reactor R-101',
      fechaConsumo: '2026-05-15',
      operador: 'Operador Test',
      detalles: [
        {
          materiaPrima: 'Ácido Hialurónico Puro',
          loteMp: 'LOT-MP-HA-101',
          programadoKg: 2.0,
          realConsumidoKg: 2.0,
          unidad: 'Kg',
          balanza: 'Balanza Test'
        }
      ],
      estado: 'Conforme',
      observaciones: 'Test consumo'
    };

    service.addConsumoMp(nuevoConsumo);

    const despues = service.inventarioLotes().find(l => l.loteInterno === 'LOT-MP-HA-101');
    expect(despues?.totalConsumido).toBe((antes?.totalConsumido || 0) + 2.0);
    expect(despues?.saldoDisponible).toBe(saldoAntes - 2.0);
    expect(despues?.movimientos.some(m => m.consumoId === 'CON-TEST-99')).toBe(true);
  });
});
