import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Iva, IvaForm } from '../models/Iva';
import api from './api';

export const ivaService = {
  async listar(buscar?: string): Promise<Iva[]> {
    const respuesta = await api.get<RespuestaLista<Iva>>('/iva', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: IvaForm): Promise<RespuestaItem<Iva>> {
    const respuesta = await api.post<RespuestaItem<Iva>>('/iva', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: IvaForm): Promise<RespuestaItem<Iva>> {
    const respuesta = await api.put<RespuestaItem<Iva>>(`/iva/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/iva/${id}`);
    return respuesta.data;
  },
};