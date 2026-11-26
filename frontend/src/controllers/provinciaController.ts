import type { Provincia, ProvinciaForm } from '../models/Provincia';
import { provinciaService } from '../services/provinciaService';
import { interpretarError } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import { limpiar, validarNombre, validarTextoObligatorio } from '../utils/validaciones';

export async function cargarProvincias(buscar: string): Promise<Resultado<Provincia[]>> {
  try {
    const datos = await provinciaService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea una provincia nueva; con un id, edita esa provincia. */
export async function guardarProvincia(
  id: number | null,
  form: ProvinciaForm
): Promise<Resultado<Provincia>> {
  // 1. Preparar los datos: sin espacios sobrantes.
  const datos: ProvinciaForm = {
    prov_codigo: limpiar(form.prov_codigo),
    prov_nombres: limpiar(form.prov_nombres),
  };

  // 2. Validar en la app (aviso rápido). La validación definitiva la hace Laravel.
  const invalido = erroresDeValidacion({
    prov_codigo: validarTextoObligatorio(datos.prov_codigo, 'el código'),
    prov_nombres: validarNombre(datos.prov_nombres, 'el nombre'),
  });
  if (invalido) return { ok: false, error: invalido };

  // 3. Enviar al servidor.
  try {
    const respuesta =
      id === null
        ? await provinciaService.crear(datos)
        : await provinciaService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarProvincia(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await provinciaService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}