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
import { cargarProveedores, eliminarProveedor } from '../controllers/proveedorController';
import type { Proveedor } from '../models/Proveedor';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProveedores'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const CajaBuscador = styled.View`
  padding: 16px 16px 0 16px;
`;

export default function ListaProveedoresView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
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

    const resultado = await cargarProveedores(texto);

    if (numero !== peticion.current) return;

    if (resultado.ok) setProveedores(resultado.datos);
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

  const editar = (proveedor: Proveedor) => navigation.navigate('FormProveedor', { proveedor });

  const eliminar = async (proveedor: Proveedor) => {
    if (eliminando.current) return;
    eliminando.current = true;
    setRefrescando(true);

    const resultado = await eliminarProveedor(proveedor.provee_id);

    eliminando.current = false;
    setRefrescando(false);

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje);
      cargar(consulta);
    } else {
      // Aquí llega, por ejemplo, el 409: "No se puede eliminar: el proveedor tiene registros asociados (4 productos)."
      Alert.alert('No se pudo eliminar', resultado.error.mensaje);
    }
  };

  const pedirConfirmacion = (proveedor: Proveedor) => {
    Alert.alert(
      'Eliminar proveedor',
      `¿Seguro que deseas eliminar a «${proveedor.provee_nombre}»? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(proveedor) },
      ]
    );
  };

  let contenido;
  if (error) {
    contenido = <ErrorConReintento mensaje={error} onReintentar={() => cargar(consulta)} />;
  } else if (cargando && proveedores.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={proveedores}
        keyExtractor={(p) => String(p.provee_id)}
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.provee_nombre}
            subtitulo={`${item.provee_codigo} · ${item.ciudad?.ciud_nombre ?? 'Sin ciudad'}`}
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
              detalle="Prueba con otro nombre o código."
            />
          ) : (
            <EstadoVacio
              mensaje="Aún no hay proveedores"
              detalle="Pulsa + para agregar el primero. Cada producto necesita un proveedor."
            />
          )
        }
      />
    );
  }

  return (
    <Raiz>
      <CajaBuscador>
        <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por nombre o código..." />
      </CajaBuscador>

      {contenido}

      <BotonFlotante onPress={() => navigation.navigate('FormProveedor')} />
    </Raiz>
  );
}