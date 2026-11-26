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
import { cargarCiudades, eliminarCiudad } from '../controllers/ciudadController';
import type { Ciudad } from '../models/Ciudad';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaCiudades'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const CajaBuscador = styled.View`
  padding: 16px 16px 0 16px;
`;

export default function ListaCiudadesView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
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

    const resultado = await cargarCiudades(texto);

    if (numero !== peticion.current) return;

    if (resultado.ok) setCiudades(resultado.datos);
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

  const editar = (ciudad: Ciudad) => navigation.navigate('FormCiudad', { ciudad });

  const eliminar = async (ciudad: Ciudad) => {
    if (eliminando.current) return;
    eliminando.current = true;
    setRefrescando(true);

    const resultado = await eliminarCiudad(ciudad.ciud_id);

    eliminando.current = false;
    setRefrescando(false);

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje);
      cargar(consulta);
    } else {
      Alert.alert('No se pudo eliminar', resultado.error.mensaje);
    }
  };

  const pedirConfirmacion = (ciudad: Ciudad) => {
    Alert.alert(
      'Eliminar ciudad',
      `¿Seguro que deseas eliminar «${ciudad.ciud_nombre}»? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(ciudad) },
      ]
    );
  };

  let contenido;
  if (error) {
    contenido = <ErrorConReintento mensaje={error} onReintentar={() => cargar(consulta)} />;
  } else if (cargando && ciudades.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={ciudades}
        keyExtractor={(c) => String(c.ciud_id)}
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.ciud_nombre}
            subtitulo={`${item.provincia?.prov_nombres ?? 'Sin provincia'} · Código: ${item.ciu_codigo}`}
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
            <EstadoVacio mensaje="Aún no hay ciudades" detalle="Pulsa + para agregar la primera." />
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

      <BotonFlotante onPress={() => navigation.navigate('FormCiudad')} />
    </Raiz>
  );
}