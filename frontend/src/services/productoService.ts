import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Producto, ProductoPayload } from '../models/Producto';
import api from './api';

export const productoService = {
  async listar(buscar?: string): Promise<Producto[]> {
    const respuesta = await api.get<RespuestaLista<Producto>>('/productos', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: ProductoPayload): Promise<RespuestaItem<Producto>> {
    const respuesta = await api.post<RespuestaItem<Producto>>('/productos', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: ProductoPayload): Promise<RespuestaItem<Producto>> {
    const respuesta = await api.put<RespuestaItem<Producto>>(`/productos/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/productos/${id}`);
    return respuesta.data;
  },
};