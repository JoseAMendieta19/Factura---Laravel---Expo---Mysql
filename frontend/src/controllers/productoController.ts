import type { Producto, ProductoForm, ProductoPayload } from '../models/Producto';
import { productoService } from '../services/productoService';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import {
  limpiar,
  validarCantidad,
  validarFechaVencimiento,
  validarPrecio,
  validarTextoObligatorio,
} from '../utils/validaciones';

// Solo existe para que TypeScript sepa que el proveedor no es null más abajo.
const ERROR_PROVEEDOR: ErrorApi = {
  tipo: 'validacion',
  mensaje: 'Revisa los campos marcados en rojo.',
  errores: { provee_id: 'Selecciona el proveedor.' },
};

export async function cargarProductos(buscar: string): Promise<Resultado<Producto[]>> {
  try {
    const datos = await productoService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea un producto nuevo; con un id, edita ese producto. */
export async function guardarProducto(
  id: number | null,
  form: ProductoForm
): Promise<Resultado<Producto>> {
  // 1. Preparar los datos: sin espacios sobrantes.
  const serie = limpiar(form.produc_serie);
  const nombre = limpiar(form.produc_nombre);
  const cantidad = limpiar(form.produc_cantidad);
  const precio = limpiar(form.produc_precio);
  const fecha = limpiar(form.produc_fecha_venci);
  const proveeId = form.provee_id;

  // 2. Validar en la app. La serie duplicada y la existencia del proveedor las comprueba Laravel.
  const invalido = erroresDeValidacion({
    produc_serie: validarTextoObligatorio(serie, 'la serie'),
    produc_nombre: validarTextoObligatorio(nombre, 'el nombre'),
    produc_cantidad: validarCantidad(cantidad),
    produc_precio: validarPrecio(precio),
    // Al crear no puede ser pasada; al editar sí (un producto ya vencido debe poder corregirse).
    produc_fecha_venci: validarFechaVencimiento(fecha, id !== null),
    provee_id: proveeId === null ? 'Selecciona el proveedor.' : null,
  });
  if (invalido || proveeId === null) {
    return { ok: false, error: invalido ?? ERROR_PROVEEDOR };
  }

  const datos: ProductoPayload = {
    produc_serie: serie,
    produc_nombre: nombre,
    produc_cantidad: cantidad,
    produc_precio: precio,
    produc_fecha_venci: fecha,
    provee_id: proveeId,
  };

  // 3. Enviar al servidor.
  try {
    const respuesta =
      id === null ? await productoService.crear(datos) : await productoService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarProducto(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await productoService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}