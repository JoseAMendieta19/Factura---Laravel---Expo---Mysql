import type { Cliente, ClienteForm, ClientePayload } from '../models/Cliente';
import { clienteService } from '../services/clienteService';
import { interpretarError, type ErrorApi } from '../utils/errores';
import { erroresDeValidacion, type Resultado } from '../utils/resultado';
import {
  limpiar,
  normalizarCorreo,
  validarCedula,
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

export async function cargarClientes(buscar: string): Promise<Resultado<Cliente[]>> {
  try {
    const datos = await clienteService.listar(limpiar(buscar));
    return { ok: true, datos, mensaje: '' };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

/** id = null crea un cliente nuevo; con un id, edita ese cliente. */
export async function guardarCliente(id: number | null, form: ClienteForm): Promise<Resultado<Cliente>> {
  // 1. Preparar los datos: sin espacios sobrantes y el correo en minúsculas.
  const cedula = limpiar(form.cli_cedula);
  const nombres = limpiar(form.cli_nombres);
  const correo = normalizarCorreo(form.cli_correo);
  const telefono = limpiar(form.cli_telefono);
  const direccion = limpiar(form.cli_direccion);
  const provId = form.prov_id;
  const ciudId = form.ciud_id;

  // 2. Validar en la app. Los duplicados y la coherencia ciudad-provincia los comprueba Laravel.
  const invalido = erroresDeValidacion({
    cli_cedula: validarCedula(cedula),
    cli_nombres: validarNombre(nombres, 'el nombre'),
    cli_correo: validarCorreo(correo),
    cli_telefono: validarTelefono(telefono),
    cli_direccion: validarTextoObligatorio(direccion, 'la dirección'),
    prov_id: provId === null ? 'Selecciona la provincia.' : null,
    ciud_id: ciudId === null ? 'Selecciona la ciudad.' : null,
  });
  if (invalido || provId === null || ciudId === null) {
    return { ok: false, error: invalido ?? ERROR_UBICACION };
  }

  const datos: ClientePayload = {
    cli_cedula: cedula,
    cli_nombres: nombres,
    cli_correo: correo,
    cli_telefono: telefono,
    cli_direccion: direccion,
    prov_id: provId,
    ciud_id: ciudId,
  };

  // 3. Enviar al servidor.
  try {
    const respuesta =
      id === null ? await clienteService.crear(datos) : await clienteService.actualizar(id, datos);

    return { ok: true, datos: respuesta.data, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}

export async function eliminarCliente(id: number): Promise<Resultado<null>> {
  try {
    const respuesta = await clienteService.eliminar(id);
    return { ok: true, datos: null, mensaje: respuesta.message };
  } catch (error) {
    return { ok: false, error: interpretarError(error) };
  }
}