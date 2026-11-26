export interface Ciudad {
  ciud_id: number;
  ciu_codigo: string;
  ciud_nombre: string;
  prov_id: number;
  // La API la incluye en el listado y en el detalle.
  provincia?: { prov_id: number; prov_nombres: string };
}

// Lo que maneja el formulario (la provincia puede estar sin elegir).
export interface CiudadForm {
  ciu_codigo: string;
  ciud_nombre: string;
  prov_id: number | null;
}

// Lo que se envía al servidor (la provincia ya es obligatoria).
export interface CiudadPayload {
  ciu_codigo: string;
  ciud_nombre: string;
  prov_id: number;
}