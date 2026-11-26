import { aCentavos } from './formato';

export interface Totales {
  subtotal: number;
  descuento: number;
  /** subtotal - descuento: la base sobre la que se calcula el IVA. */
  base: number;
  iva: number;
  total: number;
}

/** Suma precio × cantidad de cada línea, en centavos enteros. */
export function subtotalDeLineas(lineas: { precio: string | number; cantidad: number }[]): number {
  return lineas.reduce((suma, l) => suma + aCentavos(l.precio) * l.cantidad, 0);
}

/**
 * Misma fórmula que Laravel: IVA sobre (subtotal - descuento), redondeado a 2 decimales
 * con la mitad hacia arriba, todo con enteros. `tarifa` es el porcentaje en centésimas (15% = 1500).
 */
export function calcularTotales(subtotal: number, descuento: number, tarifa: number): Totales {
  const base = Math.max(subtotal - descuento, 0);
  const iva = Math.floor((base * tarifa + 5000) / 10000);
  return { subtotal, descuento, base, iva, total: base + iva };
}