import type { Factura, FacturaPayload } from '../models/Factura';
import { facturaService } from '../services/facturaService';
import { subtotalDeLineas } from '../utils/calculos';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { hoyISO } from '../utils/fechas';
import { aCentavos, deCentavos } from '../utils/formato';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import { limpiar, validarDescuento } from '../utils/validaciones';

export interface LineaFacturaForm {
  produc_id: number;
  nombre: string;
  precio: string;
  stock: number;
  cantidad: number;
}

export interface FacturaForm {
  clienteId: number | null;
  vendedorId: number | null;
  ivaId: number | null;
  descuento: string;
  lineas: LineaFacturaForm[];
}

// Solo existe para que TypeScript sepa que cliente, vendedor e IVA no son null más abajo.
const ERROR_FACTURA: ErrorApi = {
  tipo: 'validacion',
  mensaje: 'Revisa los campos marcados en rojo.',
  errores: {},
};

export async function registrarFactura(form: FacturaForm): Promise<Resultado<Factura>> {
  const descuento = limpiar(form.descuento);
  const subtotal = subtotalDeLineas(form.lineas.map((l) => ({ precio: l.precio, cantidad: l.cantidad })));

  // 1. Validar en la app. El stock real, el vencimiento y los totales los comprueba Laravel dentro de la transacción.
  const mensajes: Record<string, string | null> = {
    cli_id: form.clienteId === null ? 'Selecciona el cliente.' : null,
    vend_id: form.vendedorId === null ? 'Selecciona el vendedor.' : null,
    iva_id: form.ivaId === null ? 'Selecciona la tarifa de IVA.' : null,
    detalles: form.lineas.length === 0 ? 'Agrega al menos un producto.' : null,
    fac_descuento: validarDescuento(descuento),
  };

  if (mensajes.fac_descuento === null && aCentavos(descuento || '0') > subtotal) {
    mensajes.fac_descuento = `El descuento no puede ser mayor que el subtotal ($${deCentavos(subtotal)}).`;
  }

  form.lineas.forEach((l, i) => {
    if (l.cantidad > l.stock) {
      mensajes[`detalles.${i}.cantidad`] =
        `Stock insuficiente de «${l.nombre}»: disponible ${l.stock}, solicitado ${l.cantidad}.`;
    }
  });

  const invalido = erroresDeValidacion(mensajes);
  if (invalido || form.clienteId === null || form.vendedorId === null || form.ivaId === null) {
    return { ok: false, error: invalido ?? ERROR_FACTURA };
  }

  // 2. Preparar los datos. La fecha es SIEMPRE hoy, y se calcula aquí, al facturar
  //    (con el año, mes y día locales, sin toISOString()).
  const datos: FacturaPayload = {
    cli_id: form.clienteId,
    vend_id: form.vendedorId,
    iva_id: form.ivaId,
    fac_fecha: hoyISO(),
    fac_descuento: descuento || '0',
    detalles: form.lineas.map((l) => ({ produc_id: l.produc_id, cantidad: l.cantidad })),
  };

  // 3. Enviar al servidor.
  try {
    const respuesta = await facturaService.crear(datos);
    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}