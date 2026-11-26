import type { Ciudad } from '../models/Ciudad';
import type { Provincia } from '../models/Provincia';

// Lista de pantallas y de los parámetros que recibe cada una.
// "undefined" significa que la pantalla no recibe parámetros.
export type RootStackParamList = {
  Menu: undefined;
  ListaProvincias: undefined;
  // Sin parámetro = crear; con una provincia = editar.
  FormProvincia: { provincia?: Provincia } | undefined;
  ListaCiudades: undefined;
  FormCiudad: { ciudad?: Ciudad } | undefined;
  ListaIva: undefined;
  ListaClientes: undefined;
  ListaVendedores: undefined;
  ListaProveedores: undefined;
  ListaProductos: undefined;
  ListaFacturas: undefined;
  NuevaFactura: undefined;
};