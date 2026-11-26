import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Ciudad, CiudadPayload } from '../models/Ciudad';
import api from './api';

export const ciudadService = {
  async listar(buscar?: string, provId?: number): Promise<Ciudad[]> {
    const params: Record<string, string | number> = {};
    if (buscar) params.buscar = buscar;
    if (provId) params.prov_id = provId;

    const respuesta = await api.get<RespuestaLista<Ciudad>>('/ciudades', { params });
    return respuesta.data.data;
  },

  async crear(datos: CiudadPayload): Promise<RespuestaItem<Ciudad>> {
    const respuesta = await api.post<RespuestaItem<Ciudad>>('/ciudades', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: CiudadPayload): Promise<RespuestaItem<Ciudad>> {
    const respuesta = await api.put<RespuestaItem<Ciudad>>(`/ciudades/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/ciudades/${id}`);
    return respuesta.data;
  },
};