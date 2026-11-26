export interface Proveedor {
  provee_id: number;
  provee_codigo: string;
  provee_nombre: string;
  provee_telefono: string;
  provee_direccion: string;
  prov_id: number;
  ciud_id: number;
  // La API los incluye en el listado y en el detalle.
  ciudad?: { ciud_id: number; ciud_nombre: string };
  provincia?: { prov_id: number; prov_nombres: string };
}

// Lo que maneja el formulario (provincia y ciudad pueden estar sin elegir).
export interface ProveedorForm {
  provee_codigo: string;
  provee_nombre: string;
  provee_telefono: string;
  provee_direccion: string;
  prov_id: number | null;
  ciud_id: number | null;
}

// Lo que se envía al servidor (provincia y ciudad ya son obligatorias).
export interface ProveedorPayload {
  provee_codigo: string;
  provee_nombre: string;
  provee_telefono: string;
  provee_direccion: string;
  prov_id: number;
  ciud_id: number;
}