import type { Ciudad } from '../models/Ciudad';
import type { Cliente } from '../models/Cliente';
import type { Iva } from '../models/Iva';
import type { Producto } from '../models/Producto';
import type { Proveedor } from '../models/Proveedor';
import type { Provincia } from '../models/Provincia';
import type { Vendedor } from '../models/Vendedor';

// Lista de pantallas y de los parámetros que recibe cada una.
// "undefined" significa que la pantalla no recibe parámetros.
export type RootStackParamList = {
  Menu: undefined;
  ListaProvincias: undefined;
  FormProvincia: { provincia?: Provincia } | undefined;
  ListaCiudades: undefined;
  FormCiudad: { ciudad?: Ciudad } | undefined;
  ListaIva: undefined;
  FormIva: { iva?: Iva } | undefined;
  ListaClientes: undefined;
  FormCliente: { cliente?: Cliente } | undefined;
  ListaVendedores: undefined;
  FormVendedor: { vendedor?: Vendedor } | undefined;
  ListaProveedores: undefined;
  FormProveedor: { proveedor?: Proveedor } | undefined;
  ListaProductos: undefined;
  FormProducto: { producto?: Producto } | undefined;
  ListaFacturas: undefined;
  NuevaFactura: undefined;
};