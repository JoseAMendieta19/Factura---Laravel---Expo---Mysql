import type { Vendedor, VendedorForm, VendedorPayload } from '../models/Vendedor';
import { vendedorService } from '../services/vendedorService';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import {
  limpiar,
  normalizarCorreo,
  validarCorreo,
  validarNombre,
  validarTelefono,
  validarTextoObligatorio,
} from '../utils/validaciones';

// Solo existe para que TypeScript sepa que provincia y ciudad no son null más abajo.
const ERROR_UBICACION: ErrorApi = {
  tipo: 'validacion',
  mensaje: 'Revisa los campos marcados en rojo.',
  errores: { prov_id: 'Selecciona la provincia.', ciud_id: 'Selecciona la ciudad.' },
};

export async function cargarVendedores(buscar: string): Promise<Resultado<Vendedor[]>> {
  try {
    const datos = await vendedorService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea un vendedor nuevo; con un id, edita ese vendedor. */
export async function guardarVendedor(
  id: number | null,
  form: VendedorForm
): Promise<Resultado<Vendedor>> {
  // 1. Preparar los datos: sin espacios sobrantes y el correo en minúsculas.
  const codigo = limpiar(form.vend_codigo);
  const nombre = limpiar(form.vend_nombre);
  const correo = normalizarCorreo(form.vend_correo);
  const telefono = limpiar(form.vend_telefono);
  const provId = form.prov_id;
  const ciudId = form.ciud_id;

  // 2. Validar en la app. Los duplicados y la coherencia ciudad-provincia los comprueba Laravel.
  const invalido = erroresDeValidacion({
    vend_codigo: validarTextoObligatorio(codigo, 'el código'),
    vend_nombre: validarNombre(nombre, 'el nombre'),
    vend_correo: validarCorreo(correo),
    vend_telefono: validarTelefono(telefono),
    prov_id: provId === null ? 'Selecciona la provincia.' : null,
    ciud_id: ciudId === null ? 'Selecciona la ciudad.' : null,
  });
  if (invalido || provId === null || ciudId === null) {
    return { ok: false, error: invalido ?? ERROR_UBICACION };
  }

  const datos: VendedorPayload = {
    vend_codigo: codigo,
    vend_nombre: nombre,
    vend_correo: correo,
    vend_telefono: telefono,
    prov_id: provId,
    ciud_id: ciudId,
  };

  // 3. Enviar al servidor.
  try {
    const respuesta =
      id === null ? await vendedorService.crear(datos) : await vendedorService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarVendedor(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await vendedorService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}