import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Provincia, ProvinciaForm } from '../models/Provincia';
import api from './api';

export const provinciaService = {
  async listar(buscar?: string): Promise<Provincia[]> {
    const respuesta = await api.get<RespuestaLista<Provincia>>('/provincias', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: ProvinciaForm): Promise<RespuestaItem<Provincia>> {
    const respuesta = await api.post<RespuestaItem<Provincia>>('/provincias', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: ProvinciaForm): Promise<RespuestaItem<Provincia>> {
    const respuesta = await api.put<RespuestaItem<Provincia>>(`/provincias/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/provincias/${id}`);
    return respuesta.data;
  },
};