import type { Iva } from './Iva';

export interface DetalleFactura {
  det_fac_id: number;
  fac_id: number;
  produc_id: number;
  det_fac_cant: number;
  det_fac_precio_unitario: string;
  det_fac_total: string;
  producto?: { produc_id: number; produc_serie: string; produc_nombre: string };
}

export interface Factura {
  fac_id: number;
  fac_numero: string;
  // Formato AAAA-MM-DD.
  fac_fecha: string;
  cli_id: number;
  vend_id: number;
  fac_subtotal: string;
  iva_id: number;
  fac_descuento: string;
  fac_total: string;
  // Calculado por la API: total - subtotal + descuento.
  iva_monto: string;
  // En el listado vienen solo cédula y nombre; el detalle trae además los datos de contacto.
  cliente?: {
    cli_id: number;
    cli_cedula: string;
    cli_nombres: string;
    cli_correo?: string;
    cli_telefono?: string;
    cli_direccion?: string;
  };
  vendedor?: { vend_id: number; vend_nombre: string; vend_codigo?: string };
  iva?: Iva;
  detalles?: DetalleFactura[];
}

// Cantidad y suma de las facturas que cumplen el filtro (lo calcula la API).
export interface ResumenFacturas {
  cantidad: number;
  total: string;
}

export interface ListadoFacturas {
  facturas: Factura[];
  resumen: ResumenFacturas;
}

// Lo que se envía al servidor: solo qué se vende y a quién. Los precios y totales los calcula Laravel.
export interface FacturaPayload {
  cli_id: number;
  vend_id: number;
  iva_id: number;
  fac_fecha: string;
  fac_descuento: string;
  detalles: { produc_id: number; cantidad: number }[];
}