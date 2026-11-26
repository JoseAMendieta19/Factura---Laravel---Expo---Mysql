import type { ErrorApi } from './errores';
import type { Mensaje } from './validaciones';

// Lo que devuelve todo controlador: o salió bien (con datos y mensaje) o falló (con el error ya interpretado).
export type Resultado<T> =
  | { ok: true; datos: T; mensaje: string }
  | { ok: false; error: ErrorApi };

/**
 * Convierte { campo: mensaje | null } en un ErrorApi con el mismo formato que
 * devuelve el servidor en los errores 422. Si no hay ningún error, devuelve null.
 */
export function erroresDeValidacion(mensajes: Record<string, Mensaje>): ErrorApi | null {
  const errores: Record<string, string> = {};

  for (const [campo, mensaje] of Object.entries(mensajes)) {
    if (mensaje) errores[campo] = mensaje;
  }

  if (Object.keys(errores).length === 0) return null;

  return { tipo: 'validacion', mensaje: 'Revisa los campos marcados en rojo.', errores };
}