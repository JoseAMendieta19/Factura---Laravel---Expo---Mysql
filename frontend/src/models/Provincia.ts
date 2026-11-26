export interface Provincia {
  prov_id: number;
  prov_codigo: string;
  prov_nombres: string;
}

// Lo que el formulario envía al servidor.
export interface ProvinciaForm {
  prov_codigo: string;
  prov_nombres: string;
}