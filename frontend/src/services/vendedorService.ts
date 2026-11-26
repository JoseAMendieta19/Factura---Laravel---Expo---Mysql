import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Vendedor, VendedorPayload } from '../models/Vendedor';
import api from './api';

export const vendedorService = {
  async listar(buscar?: string): Promise<Vendedor[]> {
    const respuesta = await api.get<RespuestaLista<Vendedor>>('/vendedores', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: VendedorPayload): Promise<RespuestaItem<Vendedor>> {
    const respuesta = await api.post<RespuestaItem<Vendedor>>('/vendedores', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: VendedorPayload): Promise<RespuestaItem<Vendedor>> {
    const respuesta = await api.put<RespuestaItem<Vendedor>>(`/vendedores/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/vendedores/${id}`);
    return respuesta.data;
  },
};