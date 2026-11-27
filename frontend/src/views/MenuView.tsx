import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;
type Ruta =
  | 'ListaProvincias'
  | 'ListaCiudades'
  | 'ListaIva'
  | 'ListaClientes'
  | 'ListaVendedores'
  | 'ListaProveedores'
  | 'ListaProductos'
  | 'NuevaFactura'
  | 'ListaFacturas';

interface Opcion {
  ruta: Ruta;
  titulo: string;
  detalle: string;
  icono: keyof typeof Ionicons.glyphMap;
}

interface Seccion {
  titulo: string;
  opciones: Opcion[];
}

const SECCIONES: Seccion[] = [
  {
    titulo: 'Catálogos',
    opciones: [
      { ruta: 'ListaProvincias', titulo: 'Provincias', detalle: 'Gestiona las provincias', icono: 'location-outline' },
      { ruta: 'ListaCiudades', titulo: 'Ciudades', detalle: 'Gestiona las ciudades', icono: 'business-outline' },
      { ruta: 'ListaIva', titulo: 'IVA', detalle: 'Tarifas de impuesto', icono: 'pricetag-outline' },
    ],
  },
  {
    titulo: 'Personas',
    opciones: [
      { ruta: 'ListaClientes', titulo: 'Clientes', detalle: 'Gestiona los clientes', icono: 'people-outline' },
      { ruta: 'ListaVendedores', titulo: 'Vendedores', detalle: 'Gestiona los vendedores', icono: 'briefcase-outline' },
      { ruta: 'ListaProveedores', titulo: 'Proveedores', detalle: 'Gestiona los proveedores', icono: 'storefront-outline' },
    ],
  },
  {
    titulo: 'Inventario',
    opciones: [
      { ruta: 'ListaProductos', titulo: 'Productos', detalle: 'Stock, precios y vencimientos', icono: 'cube-outline' },
    ],
  },
  {
    titulo: 'Facturación',
    opciones: [
      { ruta: 'NuevaFactura', titulo: 'Nueva factura', detalle: 'Registrar una venta', icono: 'add-circle-outline' },
      { ruta: 'ListaFacturas', titulo: 'Facturas', detalle: 'Consultar y filtrar facturas', icono: 'receipt-outline' },
    ],
  },
];

const TituloSeccion = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.textoSecundario};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 12px 0 8px 4px;
`;

const Fila = styled.Pressable`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${colores.borde};
  padding: 14px;
  margin-bottom: 10px;
`;

const CajaIcono = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${colores.primarioClaro};
  align-items: center;
  justify-content: center;
  margin-right: 14px;
`;

const Textos = styled.View`
  flex: 1;
`;

const Titulo = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

const Detalle = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

export default function MenuView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colores.fondo }}
      contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}
    >
      {SECCIONES.map((seccion) => (
        <Fragmento key={seccion.titulo} seccion={seccion} abrir={(ruta) => navigation.navigate(ruta)} />
      ))}
    </ScrollView>
  );
}

function Fragmento({ seccion, abrir }: { seccion: Seccion; abrir: (ruta: Ruta) => void }) {
  return (
    <>
      <TituloSeccion>{seccion.titulo}</TituloSeccion>
      {seccion.opciones.map((opcion) => (
        <Fila
          key={opcion.ruta}
          onPress={() => abrir(opcion.ruta)}
          accessibilityRole="button"
          accessibilityLabel={opcion.titulo}
        >
          <CajaIcono>
            <Ionicons name={opcion.icono} size={24} color={colores.primario} />
          </CajaIcono>
          <Textos>
            <Titulo>{opcion.titulo}</Titulo>
            <Detalle>{opcion.detalle}</Detalle>
          </Textos>
          <Ionicons name="chevron-forward" size={20} color={colores.textoSecundario} />
        </Fila>
      ))}
    </>
  );
}