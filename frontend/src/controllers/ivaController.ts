import type { Iva, IvaForm } from '../models/Iva';
import { ivaService } from '../services/ivaService';
import { interpretarError } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import { limpiar, validarPorcentaje, validarTextoObligatorio } from '../utils/validaciones';

export async function cargarTarifasIva(buscar: string): Promise<Resultado<Iva[]>> {
  try {
    const datos = await ivaService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea una tarifa nueva; con un id, edita esa tarifa. */
export async function guardarIva(id: number | null, form: IvaForm): Promise<Resultado<Iva>> {
  const datos: IvaForm = {
    iva_nombre: limpiar(form.iva_nombre),
    iva_valor: limpiar(form.iva_valor),
  };

  // Validación en la app. La definitiva (incluidos los duplicados) la hace Laravel.
  const invalido = erroresDeValidacion({
    iva_nombre: validarTextoObligatorio(datos.iva_nombre, 'el nombre'),
    iva_valor: validarPorcentaje(datos.iva_valor),
  });
  if (invalido) return { ok: false, error: invalido };

  try {
    const respuesta =
      id === null ? await ivaService.crear(datos) : await ivaService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarIva(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await ivaService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}