/** "2.50" o 2.5 -> 250 (centavos enteros). Los textos no numéricos dan 0. */
export function aCentavos(valor: string | number): number {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.round(numero * 100);
}

/** 250 -> "2.50" (formato que espera la API). */
export function deCentavos(centavos: number): string {
  const signo = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  return `${signo}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** "1234.5" -> "$1,234.50" */
export function formatoDinero(valor: string | number): string {
  const centavos = aCentavos(valor);
  const signo = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  const enteros = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${signo}$${enteros}.${String(abs % 100).padStart(2, '0')}`;
}