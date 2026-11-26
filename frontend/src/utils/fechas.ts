const dos = (n: number): string => String(n).padStart(2, '0');

/**
 * Convierte un Date a "AAAA-MM-DD" usando el año, mes y día LOCALES.
 * NO usa toISOString(): ese método convierte a UTC y en Ecuador, después de las 19:00,
 * devuelve el día siguiente.
 */
export function fechaLocalAISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

export function hoyISO(): string {
  return fechaLocalAISO(new Date());
}

/** Comprueba que el texto sea AAAA-MM-DD y que la fecha exista (rechaza 2026-02-30). */
export function esFechaValida(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;

  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const fecha = new Date(anio, mes - 1, dia);

  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

/** Las fechas ISO se comparan como texto: "2026-11-24" < "2026-11-25". */
export function esFechaPasada(iso: string, hoy: string = hoyISO()): boolean {
  return iso < hoy;
}

/** "2026-11-25" -> "25/11/2026". Parte el texto; no crea un Date, así no hay corrimiento de día. */
export function formatoFechaCorta(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}