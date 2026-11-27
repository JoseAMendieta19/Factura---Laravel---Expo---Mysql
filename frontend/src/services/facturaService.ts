import type { RespuestaItem } from '../models/api';
import type { Factura, FacturaPayload, ListadoFacturas, ResumenFacturas } from '../models/Factura';
import api from './api';

export interface FiltrosApi {
  buscar?: string;
  desde?: string;
  hasta?: string;
}

export const facturaService = {
  async listar(filtros: FiltrosApi): Promise<ListadoFacturas> {
    // Solo se envían los filtros que tienen valor.
    const params: Record<string, string> = {};
    if (filtros.buscar) params.buscar = filtros.buscar;
    if (filtros.desde) params.desde = filtros.desde;
    if (filtros.hasta) params.hasta = filtros.hasta;

    const respuesta = await api.get<{ data: Factura[]; resumen: ResumenFacturas }>('/facturas', { params });
    return { facturas: respuesta.data.data, resumen: respuesta.data.resumen };
  },

  async obtener(id: number): Promise<Factura> {
    const respuesta = await api.get<{ data: Factura }>(`/facturas/${id}`);
    return respuesta.data.data;
  },

  async crear(datos: FacturaPayload): Promise<RespuestaItem<Factura>> {
    const respuesta = await api.post<RespuestaItem<Factura>>('/facturas', datos);
    return respuesta.data;
  },
};