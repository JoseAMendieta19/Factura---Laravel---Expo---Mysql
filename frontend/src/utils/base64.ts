const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const TABLA: Record<string, number> = {};
for (let i = 0; i < ALFABETO.length; i++) {
  TABLA[ALFABETO.charAt(i)] = i;
}

/** Convierte texto base64 en bytes. Ignora el relleno "=" y los espacios o saltos de línea. */
export function base64ABytes(base64: string): Uint8Array {
  const limpio = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((limpio.length * 3) / 4));

  let buffer = 0;
  let bits = 0;
  let indice = 0;

  for (let i = 0; i < limpio.length; i++) {
    buffer = (buffer << 6) | TABLA[limpio.charAt(i)];
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes[indice++] = (buffer >> bits) & 0xff;
      buffer &= (1 << bits) - 1;
    }
  }

  return bytes;
}