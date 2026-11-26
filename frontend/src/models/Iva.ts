export interface Iva {
  iva_id: number;
  iva_nombre: string;
  // La API lo entrega como texto con 2 decimales: "15.00".
  iva_valor: string;
}

// Lo que maneja el formulario y lo que se envía al servidor.
export interface IvaForm {
  iva_nombre: string;
  iva_valor: string;
}