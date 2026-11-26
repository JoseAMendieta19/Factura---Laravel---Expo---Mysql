import type { RespuestaItem } from '../models/api';
import type { Factura, FacturaPayload } from '../models/Factura';
import api from './api';

export const facturaService = {
  async crear(datos: FacturaPayload): Promise<RespuestaItem<Factura>> {
    const respuesta = await api.post<RespuestaItem<Factura>>('/facturas', datos);
    return respuesta.data;
  },
};