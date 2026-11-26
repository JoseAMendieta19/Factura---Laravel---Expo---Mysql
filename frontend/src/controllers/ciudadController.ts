import type { Ciudad, CiudadForm, CiudadPayload } from '../models/Ciudad';
import { ciudadService } from '../services/ciudadService';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import { limpiar, validarTextoObligatorio } from '../utils/validaciones';

// Solo existe para que TypeScript sepa que prov_id no es null más abajo.
const ERROR_PROVINCIA: ErrorApi = {
  tipo: 'validacion',
  mensaje: 'Revisa los campos marcados en rojo.',
  errores: { prov_id: 'Selecciona la provincia.' },
};

export async function cargarCiudades(buscar: string): Promise<Resultado<Ciudad[]>> {
  try {
    const datos = await ciudadService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea una ciudad nueva; con un id, edita esa ciudad. */
export async function guardarCiudad(id: number | null, form: CiudadForm): Promise<Resultado<Ciudad>> {
  const codigo = limpiar(form.ciu_codigo);
  const nombre = limpiar(form.ciud_nombre);
  const provId = form.prov_id;

  // Validación en la app. La definitiva la hace Laravel.
  const invalido = erroresDeValidacion({
    ciu_codigo: validarTextoObligatorio(codigo, 'el código'),
    ciud_nombre: validarTextoObligatorio(nombre, 'el nombre'),
    prov_id: provId === null ? 'Selecciona la provincia.' : null,
  });
  if (invalido || provId === null) {
    return { ok: false, error: invalido ?? ERROR_PROVINCIA };
  }

  const datos: CiudadPayload = { ciu_codigo: codigo, ciud_nombre: nombre, prov_id: provId };

  try {
    const respuesta =
      id === null ? await ciudadService.crear(datos) : await ciudadService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarCiudad(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await ciudadService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}