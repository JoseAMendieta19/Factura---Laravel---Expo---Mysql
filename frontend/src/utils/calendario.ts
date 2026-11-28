import { esFechaValida } from './fechas';

export const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// La semana empieza en lunes.
export const ENCABEZADO_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const ANIO_MINIMO = 1900;
export const ANIO_MAXIMO = 2100;

export interface FechaPartes {
  anio: number;
  mes: number; // 1 a 12
  dia: number;
}

const dos = (n: number): string => String(n).padStart(2, '0');

/** (2026, 1, 5) -> "2026-01-05". El mes va de 1 a 12. */
export function aISO(anio: number, mes: number, dia: number): string {
  return `${String(anio).padStart(4, '0')}-${dos(mes)}-${dos(dia)}`;
}

/** "2026-11-26" -> { anio: 2026, mes: 11, dia: 26 }. Devuelve null si no es una fecha real. */
export function desglosarISO(iso: string): FechaPartes | null {
  if (!esFechaValida(iso)) return null;
  return {
    anio: Number(iso.slice(0, 4)),
    mes: Number(iso.slice(5, 7)),
    dia: Number(iso.slice(8, 10)),
  };
}

/** Días que tiene un mes (el 0 del mes siguiente es el último día de este). */
export function diasEnMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate();
}

/** Columna del día 1 en una semana que empieza en lunes: 0 = lunes ... 6 = domingo. */
export function primerDiaSemana(anio: number, mes: number): number {
  return (new Date(anio, mes - 1, 1).getDay() + 6) % 7;
}

/** El mes como una cuadrícula de 6 filas × 7 columnas (siempre 6, para que el calendario no cambie de alto). */
export function construirMes(anio: number, mes: number): (number | null)[][] {
  const celdas: (number | null)[] = [];

  for (let i = 0; i < primerDiaSemana(anio, mes); i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes(anio, mes); d++) celdas.push(d);
  while (celdas.length < 42) celdas.push(null);

  const filas: (number | null)[][] = [];
  for (let i = 0; i < 42; i += 7) filas.push(celdas.slice(i, i + 7));
  return filas;
}

/** Suma o resta meses: (2026, 12, +1) -> enero de 2027. */
export function moverMes(anio: number, mes: number, delta: number): { anio: number; mes: number } {
  const total = anio * 12 + (mes - 1) + delta;
  return { anio: Math.floor(total / 12), mes: (((total % 12) + 12) % 12) + 1 };
}

/** Las fechas ISO se comparan como texto: "2026-11-25" < "2026-11-26". */
export function diaDeshabilitado(iso: string, minimo?: string, maximo?: string): boolean {
  return (!!minimo && iso < minimo) || (!!maximo && iso > maximo);
}

/** Un mes se puede visitar si al menos uno de sus días cae dentro de [minimo, maximo]. */
export function mesAccesible(anio: number, mes: number, minimo?: string, maximo?: string): boolean {
  if (anio < ANIO_MINIMO || anio > ANIO_MAXIMO) return false;
  if (minimo && aISO(anio, mes, diasEnMes(anio, mes)) < minimo) return false;
  if (maximo && aISO(anio, mes, 1) > maximo) return false;
  return true;
}

/** Mes que se muestra al abrir: el de la fecha elegida; si no hay, el de hoy; y siempre dentro de los límites. */
export function mesInicial(
  valor: string,
  minimo: string | undefined,
  maximo: string | undefined,
  hoy: string
): { anio: number; mes: number } {
  let base = desglosarISO(valor) ? valor : hoy;
  if (minimo && base < minimo) base = minimo;
  if (maximo && base > maximo) base = maximo;

  const partes = desglosarISO(base) ?? desglosarISO(hoy);
  const ahora = new Date();
  return {
    anio: partes?.anio ?? ahora.getFullYear(),
    mes: partes?.mes ?? ahora.getMonth() + 1,
  };
}