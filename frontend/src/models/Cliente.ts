export interface Cliente {
  cli_id: number;
  cli_cedula: string;
  cli_nombres: string;
  cli_correo: string;
  cli_telefono: string;
  cli_direccion: string;
  ciud_id: number;
  prov_id: number;
  // La API los incluye en el listado y en el detalle.
  ciudad?: { ciud_id: number; ciud_nombre: string };
  provincia?: { prov_id: number; prov_nombres: string };
}

// Lo que maneja el formulario (provincia y ciudad pueden estar sin elegir).
export interface ClienteForm {
  cli_cedula: string;
  cli_nombres: string;
  cli_correo: string;
  cli_telefono: string;
  cli_direccion: string;
  prov_id: number | null;
  ciud_id: number | null;
}

// Lo que se envía al servidor (provincia y ciudad ya son obligatorias).
export interface ClientePayload {
  cli_cedula: string;
  cli_nombres: string;
  cli_correo: string;
  cli_telefono: string;
  cli_direccion: string;
  prov_id: number;
  ciud_id: number;
}