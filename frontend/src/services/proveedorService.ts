import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Proveedor, ProveedorPayload } from '../models/Proveedor';
import api from './api';

export const proveedorService = {
  async listar(buscar?: string): Promise<Proveedor[]> {
    const respuesta = await api.get<RespuestaLista<Proveedor>>('/proveedores', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: ProveedorPayload): Promise<RespuestaItem<Proveedor>> {
    const respuesta = await api.post<RespuestaItem<Proveedor>>('/proveedores', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: ProveedorPayload): Promise<RespuestaItem<Proveedor>> {
    const respuesta = await api.put<RespuestaItem<Proveedor>>(`/proveedores/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/proveedores/${id}`);
    return respuesta.data;
  },
};