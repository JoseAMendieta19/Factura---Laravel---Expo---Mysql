import type { RespuestaItem, RespuestaLista, RespuestaMensaje } from '../models/api';
import type { Cliente, ClientePayload } from '../models/Cliente';
import api from './api';

export const clienteService = {
  async listar(buscar?: string): Promise<Cliente[]> {
    const respuesta = await api.get<RespuestaLista<Cliente>>('/clientes', {
      params: buscar ? { buscar } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(datos: ClientePayload): Promise<RespuestaItem<Cliente>> {
    const respuesta = await api.post<RespuestaItem<Cliente>>('/clientes', datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: ClientePayload): Promise<RespuestaItem<Cliente>> {
    const respuesta = await api.put<RespuestaItem<Cliente>>(`/clientes/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<RespuestaMensaje> {
    const respuesta = await api.delete<RespuestaMensaje>(`/clientes/${id}`);
    return respuesta.data;
  },
};