import type { Proveedor, ProveedorForm, ProveedorPayload } from '../models/Proveedor';
import { proveedorService } from '../services/proveedorService';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import { limpiar, validarTelefono, validarTextoObligatorio } from '../utils/validaciones';

// Solo existe para que TypeScript sepa que provincia y ciudad no son null más abajo.
const ERROR_UBICACION: ErrorApi = {
  tipo: 'validacion',
  mensaje: 'Revisa los campos marcados en rojo.',
  errores: { prov_id: 'Selecciona la provincia.', ciud_id: 'Selecciona la ciudad.' },
};

export async function cargarProveedores(buscar: string): Promise<Resultado<Proveedor[]>> {
  try {
    const datos = await proveedorService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea un proveedor nuevo; con un id, edita ese proveedor. */
export async function guardarProveedor(
  id: number | null,
  form: ProveedorForm
): Promise<Resultado<Proveedor>> {
  // 1. Preparar los datos: sin espacios sobrantes.
  const codigo = limpiar(form.provee_codigo);
  const nombre = limpiar(form.provee_nombre);
  const telefono = limpiar(form.provee_telefono);
  const direccion = limpiar(form.provee_direccion);
  const provId = form.prov_id;
  const ciudId = form.ciud_id;

  // 2. Validar en la app. Los duplicados y la coherencia ciudad-provincia los comprueba Laravel.
  // El nombre es una razón social: puede llevar números y símbolos, por eso no se exige "solo letras".
  const invalido = erroresDeValidacion({
    provee_codigo: validarTextoObligatorio(codigo, 'el código'),
    provee_nombre: validarTextoObligatorio(nombre, 'el nombre'),
    provee_telefono: validarTelefono(telefono),
    provee_direccion: validarTextoObligatorio(direccion, 'la dirección'),
    prov_id: provId === null ? 'Selecciona la provincia.' : null,
    ciud_id: ciudId === null ? 'Selecciona la ciudad.' : null,
  });
  if (invalido || provId === null || ciudId === null) {
    return { ok: false, error: invalido ?? ERROR_UBICACION };
  }

  const datos: ProveedorPayload = {
    provee_codigo: codigo,
    provee_nombre: nombre,
    provee_telefono: telefono,
    provee_direccion: direccion,
    prov_id: provId,
    ciud_id: ciudId,
  };

  // 3. Enviar al servidor.
  try {
    const respuesta =
      id === null ? await proveedorService.crear(datos) : await proveedorService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarProveedor(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await proveedorService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}