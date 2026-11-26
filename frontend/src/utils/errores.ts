import axios from 'axios';

export type TipoError =
  | 'validacion'
  | 'conflicto'
  | 'no_encontrado'
  | 'servidor'
  | 'sin_conexion'
  | 'timeout'
  | 'desconocido';

export interface ErrorApi {
  tipo: TipoError;
  mensaje: string;
  /** Solo en errores 422: un mensaje por campo, por ejemplo { cli_cedula: '...' } */
  errores: Record<string, string>;
}

interface RespuestaErrorLaravel {
  message?: string;
  errors?: Record<string, string[]>;
}

export function interpretarError(error: unknown): ErrorApi {
  if (!axios.isAxiosError<RespuestaErrorLaravel>(error)) {
    return {
      tipo: 'desconocido',
      mensaje: 'Ocurrió un error inesperado. Intenta nuevamente.',
      errores: {},
    };
  }

  // Sin respuesta del servidor: el tiempo se agotó o no hay conexión.
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        tipo: 'timeout',
        mensaje: 'El servidor tardó demasiado en responder. Intenta nuevamente.',
        errores: {},
      };
    }
    return {
      tipo: 'sin_conexion',
      mensaje: 'No hay conexión con el servidor. Verifica tu red y que el servidor esté encendido.',
      errores: {},
    };
  }

  const { status, data } = error.response;

  if (status === 422) {
    const errores: Record<string, string> = {};
    for (const [campo, mensajes] of Object.entries(data?.errors ?? {})) {
      errores[campo] = mensajes[0] ?? '';
    }
    return { tipo: 'validacion', mensaje: 'Revisa los campos marcados en rojo.', errores };
  }

  if (status === 409) {
    return {
      tipo: 'conflicto',
      mensaje: data?.message ?? 'No se pudo completar la operación.',
      errores: {},
    };
  }

  if (status === 404) {
    return {
      tipo: 'no_encontrado',
      mensaje: data?.message ?? 'El registro solicitado no existe.',
      errores: {},
    };
  }

  if (status >= 500) {
    return {
      tipo: 'servidor',
      mensaje: `Error del servidor (${status}). Intenta nuevamente más tarde.`,
      errores: {},
    };
  }

  return {
    tipo: 'desconocido',
    mensaje: data?.message ?? `Error inesperado (${status}).`,
    errores: {},
  };
}