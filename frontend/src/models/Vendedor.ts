export interface Vendedor {
  vend_id: number;
  vend_codigo: string;
  vend_nombre: string;
  vend_correo: string;
  vend_telefono: string;
  prov_id: number;
  ciud_id: number;
  // La API los incluye en el listado y en el detalle.
  ciudad?: { ciud_id: number; ciud_nombre: string };
  provincia?: { prov_id: number; prov_nombres: string };
}

// Lo que maneja el formulario (provincia y ciudad pueden estar sin elegir).
export interface VendedorForm {
  vend_codigo: string;
  vend_nombre: string;
  vend_correo: string;
  vend_telefono: string;
  prov_id: number | null;
  ciud_id: number | null;
}

// Lo que se envía al servidor (provincia y ciudad ya son obligatorias).
export interface VendedorPayload {
  vend_codigo: string;
  vend_nombre: string;
  vend_correo: string;
  vend_telefono: string;
  prov_id: number;
  ciud_id: number;
}