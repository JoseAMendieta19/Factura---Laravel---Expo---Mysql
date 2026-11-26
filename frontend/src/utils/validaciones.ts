import { esFechaPasada, esFechaValida, hoyISO } from './fechas';

/** null = válido; texto = mensaje de error para mostrar junto al campo. */
export type Mensaje = string | null;

// Letras del español (con tildes, ü y ñ).
const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const REGEX_SOLO_LETRAS = new RegExp(`^[${LETRAS}]+(?: [${LETRAS}]+)*$`);
const REGEX_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const mayuscula = (texto: string): string => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Quita espacios al inicio y al final y colapsa los repetidos. "   " queda "". */
export const limpiar = (valor: string): string => valor.replace(/\s+/g, ' ').trim();

export const normalizarCorreo = (valor: string): string => limpiar(valor).toLowerCase();

// ---------- Filtros: se aplican CADA VEZ que el usuario escribe ----------

/** Deja solo dígitos y corta al máximo. */
export const filtrarDigitos = (texto: string, max: number): string =>
  texto.replace(/\D/g, '').slice(0, max);

/** Deja letras y espacios; sin espacio inicial ni dobles. (El espacio final se permite al escribir.) */
export const filtrarLetras = (texto: string): string =>
  texto
    .replace(new RegExp(`[^${LETRAS} ]`, 'g'), '')
    .replace(/^ +/, '')
    .replace(/ {2,}/g, ' ');

/** Número con un solo punto; acepta la coma como punto decimal. */
export function filtrarDecimal(texto: string, maxEnteros: number, maxDecimales: number): string {
  const limpio = texto.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const posPunto = limpio.indexOf('.');

  if (posPunto === -1) return limpio.slice(0, maxEnteros);

  const enteros = limpio.slice(0, posPunto).slice(0, maxEnteros);
  const decimales = limpio
    .slice(posPunto + 1)
    .replace(/\./g, '')
    .slice(0, maxDecimales);

  return `${enteros}.${decimales}`;
}

export const esSoloLetras = (valor: string): boolean => REGEX_SOLO_LETRAS.test(valor);

// ---------- Validadores: se aplican al guardar ----------

/** `campo` va con artículo y en minúscula: "la dirección", "el nombre". */
export function validarTextoObligatorio(valor: string, campo: string, max = 45): Mensaje {
  const v = limpiar(valor);
  if (!v) return `Ingresa ${campo}.`;
  if (v.length > max) return `${mayuscula(campo)} no puede superar los ${max} caracteres.`;
  return null;
}

export function validarNombre(valor: string, campo = 'el nombre', max = 45): Mensaje {
  const basico = validarTextoObligatorio(valor, campo, max);
  if (basico) return basico;
  if (!esSoloLetras(limpiar(valor))) {
    return `${mayuscula(campo)} solo puede contener letras y espacios.`;
  }
  return null;
}

/** Cédula ecuatoriana: mismas reglas que el servidor (provincia, tercer dígito y módulo 10). */
export function validarCedula(valor: string): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa la cédula.';
  if (!/^\d+$/.test(v)) return 'La cédula solo puede contener números.';
  if (v.length < 10) return `La cédula debe tener 10 dígitos (faltan ${10 - v.length}).`;
  if (v.length > 10) return `La cédula debe tener exactamente 10 dígitos (sobran ${v.length - 10}).`;

  const provincia = Number(v.slice(0, 2));
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
    return 'La cédula no es válida: el código de provincia no existe.';
  }

  if (Number(v[2]) > 5) return 'La cédula no es válida: el tercer dígito debe ser menor que 6.';

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let producto = Number(v[i]) * (i % 2 === 0 ? 2 : 1);
    if (producto > 9) producto -= 9;
    suma += producto;
  }
  const verificador = (10 - (suma % 10)) % 10;

  if (verificador !== Number(v[9])) {
    return 'La cédula no es válida: el dígito verificador no coincide.';
  }
  return null;
}

/** Celular: 09 + 8 dígitos (10 en total). */
export function validarTelefono(valor: string): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa el teléfono.';
  if (!/^\d+$/.test(v)) return 'El teléfono solo puede contener números.';
  if (v.length < 10) return `El teléfono debe tener 10 dígitos (faltan ${10 - v.length}).`;
  if (v.length > 10) return `El teléfono debe tener exactamente 10 dígitos (sobran ${v.length - 10}).`;
  if (!v.startsWith('09')) return 'El teléfono debe empezar con 09 (celular).';
  return null;
}

export function validarCorreo(valor: string, max = 45): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa el correo.';
  if (v.length > max) return `El correo no puede superar los ${max} caracteres.`;
  if (!REGEX_CORREO.test(v)) {
    return 'El correo debe tener un formato válido (por ejemplo, nombre@dominio.com).';
  }
  return null;
}

/** Precio: mayor que 0, máximo 2 decimales. */
export function validarPrecio(valor: string): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa el precio.';
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'El precio debe ser un número con máximo 2 decimales.';
  if (Number(v) <= 0) return 'El precio debe ser mayor que 0.';
  if (Number(v) > 99999999.99) return 'El precio no puede ser mayor que 99999999.99.';
  return null;
}

/** Cantidad: entero, 0 o más. */
export function validarCantidad(valor: string): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa la cantidad.';
  if (!/^\d+$/.test(v)) return 'La cantidad debe ser un número entero.';
  if (Number(v) > 99999999) return 'La cantidad no puede ser mayor que 99999999.';
  return null;
}

/** Fecha de vencimiento AAAA-MM-DD. Al crear no puede ser pasada; al editar sí (permitirPasada = true). */
export function validarFechaVencimiento(
  valor: string,
  permitirPasada: boolean,
  hoy: string = hoyISO()
): Mensaje {
  const v = limpiar(valor);
  if (!v) return 'Ingresa la fecha de vencimiento.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'La fecha de vencimiento debe tener el formato AAAA-MM-DD.';
  if (!esFechaValida(v)) return 'La fecha de vencimiento no es una fecha real.';
  if (!permitirPasada && esFechaPasada(v, hoy)) {
    return 'La fecha de vencimiento no puede ser anterior a hoy.';
  }
  return null;
}