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
import { cargarVendedores, eliminarVendedor } from '../controllers/vendedorController';
import type { Vendedor } from '../models/Vendedor';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaVendedores'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const CajaBuscador = styled.View`
  padding: 16px 16px 0 16px;
`;

export default function ListaVendedoresView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
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

    const resultado = await cargarVendedores(texto);

    if (numero !== peticion.current) return;

    if (resultado.ok) setVendedores(resultado.datos);
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

  const editar = (vendedor: Vendedor) => navigation.navigate('FormVendedor', { vendedor });

  const eliminar = async (vendedor: Vendedor) => {
    if (eliminando.current) return;
    eliminando.current = true;
    setRefrescando(true);

    const resultado = await eliminarVendedor(vendedor.vend_id);

    eliminando.current = false;
    setRefrescando(false);

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje);
      cargar(consulta);
    } else {
      // Aquí llega, por ejemplo, el 409: "No se puede eliminar: el vendedor tiene registros asociados (7 facturas)."
      Alert.alert('No se pudo eliminar', resultado.error.mensaje);
    }
  };

  const pedirConfirmacion = (vendedor: Vendedor) => {
    Alert.alert(
      'Eliminar vendedor',
      `¿Seguro que deseas eliminar a «${vendedor.vend_nombre}»? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(vendedor) },
      ]
    );
  };

  let contenido;
  if (error) {
    contenido = <ErrorConReintento mensaje={error} onReintentar={() => cargar(consulta)} />;
  } else if (cargando && vendedores.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={vendedores}
        keyExtractor={(v) => String(v.vend_id)}
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.vend_nombre}
            subtitulo={`${item.vend_codigo} · ${item.ciudad?.ciud_nombre ?? 'Sin ciudad'}`}
            onPress={() => editar(item)}
            onEditar={() => editar(item)}
            onEliminar={() => pedirConfirmacion(item)}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, flexGrow: 1 }}
        refreshing={refrescando}
        onRefresh={() => cargar(consulta, 'refrescar')}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          consulta ? (
            <EstadoVacio
              mensaje={`Sin resultados para «${consulta}»`}
              detalle="Prueba con otro nombre, código o correo."
            />
          ) : (
            <EstadoVacio
              mensaje="Aún no hay vendedores"
              detalle="Pulsa + para agregar el primero. Sin vendedores no se pueden crear facturas."
            />
          )
        }
      />
    );
  }

  return (
    <Raiz>
      <CajaBuscador>
        <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por nombre, código o correo..." />
      </CajaBuscador>

      {contenido}

      <BotonFlotante onPress={() => navigation.navigate('FormVendedor')} />
    </Raiz>
  );
}