export interface Producto {
  produc_id: number;
  produc_serie: string;
  produc_nombre: string;
  // La API la entrega como número entero (50).
  produc_cantidad: number;
  provee_id: number;
  // Formato AAAA-MM-DD.
  produc_fecha_venci: string;
  // La API lo entrega como texto con 2 decimales: "2.50".
  produc_precio: string;
  // La API la incluye en el listado y en el detalle.
  proveedor?: { provee_id: number; provee_nombre: string };
}

// Lo que maneja el formulario (el proveedor puede estar sin elegir).
export interface ProductoForm {
  produc_serie: string;
  produc_nombre: string;
  produc_cantidad: string;
  produc_precio: string;
  produc_fecha_venci: string;
  provee_id: number | null;
}

// Lo que se envía al servidor (el proveedor ya es obligatorio).
export interface ProductoPayload {
  produc_serie: string;
  produc_nombre: string;
  produc_cantidad: string;
  produc_precio: string;
  produc_fecha_venci: string;
  provee_id: number;
}