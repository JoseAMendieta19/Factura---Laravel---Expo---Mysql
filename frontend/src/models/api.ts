// Forma de las respuestas de la API de Laravel.
export interface RespuestaLista<T> {
  data: T[];
}

export interface RespuestaItem<T> {
  message: string;
  data: T;
}

export interface RespuestaMensaje {
  message: string;
}