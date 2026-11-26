import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import BotonFlotante from '../components/BotonFlotante';
import Buscador from '../components/Buscador';
import { Cargando, ErrorConReintento, EstadoVacio } from '../components/Estados';
import TarjetaLista from '../components/TarjetaLista';
import { cargarProductos, eliminarProducto } from '../controllers/productoController';
import type { Producto } from '../models/Producto';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';
import { esFechaPasada, formatoFechaCorta } from '../utils/fechas';
import { formatoDinero } from '../utils/formato';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProductos'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const CajaBuscador = styled.View`
  padding: 16px 16px 0 16px;
`;

export default function ListaProductosView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [consulta, setConsulta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peticion = useRef(0);
  const eliminando = useRef(false);

  const cargar = useCallback(async (texto: string, modo: 'normal' | 'refrescar' = 'normal') => {
    const numero = ++peticion.current;
    if (modo === 'refrescar') setRefrescando(true);
    else setCargando(true);
    setError(null);

    const resultado = await cargarProductos(texto);

    if (numero !== peticion.current) return;

    if (resultado.ok) setProductos(resultado.datos);
    else setError(resultado.error.mensaje);

    setCargando(false);
    setRefrescando(false);
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => setConsulta(busqueda.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  useFocusEffect(
    useCallback(() => {
      cargar(consulta);
    }, [cargar, consulta])
  );

  const editar = (producto: Producto) => navigation.navigate('FormProducto', { producto });

  const eliminar = async (producto: Producto) => {
    if (eliminando.current) return;
    eliminando.current = true;
    setRefrescando(true);

    const resultado = await eliminarProducto(producto.produc_id);

    eliminando.current = false;
    setRefrescando(false);

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje);
      cargar(consulta);
    } else {
      // Aquí llega, por ejemplo, el 409: "No se puede eliminar: el producto tiene registros asociados (3 líneas de factura)."
      Alert.alert('No se pudo eliminar', resultado.error.mensaje);
    }
  };

  const pedirConfirmacion = (producto: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que deseas eliminar «${producto.produc_nombre}»? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(producto) },
      ]
    );
  };

  let contenido;
  if (error) {
    contenido = <ErrorConReintento mensaje={error} onReintentar={() => cargar(consulta)} />;
  } else if (cargando && productos.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={productos}
        keyExtractor={(p) => String(p.produc_id)}
        renderItem={({ item }) => {
          // Vence hoy todavía se puede vender; vencido es solo lo anterior a hoy.
          const vencido = esFechaPasada(item.produc_fecha_venci);

          return (
            <TarjetaLista
              titulo={item.produc_nombre}
              subtitulo={`${item.produc_serie} · Stock: ${item.produc_cantidad} · ${formatoDinero(item.produc_precio)}`}
              detalle={`Vence: ${formatoFechaCorta(item.produc_fecha_venci)}${vencido ? ' (VENCIDO)' : ''}`}
              detalleAlerta={vencido}
              onPress={() => editar(item)}
              onEditar={() => editar(item)}
              onEliminar={() => pedirConfirmacion(item)}
            />
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, flexGrow: 1 }}
        refreshing={refrescando}
        onRefresh={() => cargar(consulta, 'refrescar')}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          consulta ? (
            <EstadoVacio
              mensaje={`Sin resultados para «${consulta}»`}
              detalle="Prueba con otro nombre o serie."
            />
          ) : (
            <EstadoVacio mensaje="Aún no hay productos" detalle="Pulsa + para agregar el primero." />
          )
        }
      />
    );
  }

  return (
    <Raiz>
      <CajaBuscador>
        <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por nombre o serie..." />
      </CajaBuscador>

      {contenido}

      <BotonFlotante onPress={() => navigation.navigate('FormProducto')} />
    </Raiz>
  );
}