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
import { cargarProvincias, eliminarProvincia } from '../controllers/provinciaController';
import type { Provincia } from '../models/Provincia';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProvincias'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const CajaBuscador = styled.View`
  padding: 16px 16px 0 16px;
`;

export default function ListaProvinciasView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [busqueda, setBusqueda] = useState(''); // lo que se escribe
  const [consulta, setConsulta] = useState(''); // lo que se envía al servidor (con retraso)
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

    const resultado = await cargarProvincias(texto);

    // Si mientras tanto se lanzó una petición más nueva, esta respuesta se descarta.
    if (numero !== peticion.current) return;

    if (resultado.ok) setProvincias(resultado.datos);
    else setError(resultado.error.mensaje);

    setCargando(false);
    setRefrescando(false);
  }, []);

  // Espera 400 ms sin teclear antes de buscar en el servidor.
  useEffect(() => {
    const temporizador = setTimeout(() => setConsulta(busqueda.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  // Se ejecuta al entrar a la pantalla, al volver desde el formulario y cuando cambia la búsqueda.
  useFocusEffect(
    useCallback(() => {
      cargar(consulta);
    }, [cargar, consulta])
  );

  const editar = (provincia: Provincia) => navigation.navigate('FormProvincia', { provincia });

  const eliminar = async (provincia: Provincia) => {
    if (eliminando.current) return;
    eliminando.current = true;
    setRefrescando(true); // reutilizamos el indicador de refresco como indicador de carga

    const resultado = await eliminarProvincia(provincia.prov_id);

    eliminando.current = false;
    setRefrescando(false);

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje);
      cargar(consulta);
    } else {
      // Aquí llega, por ejemplo, el 409: "No se puede eliminar: tiene 7 ciudades asociadas".
      Alert.alert('No se pudo eliminar', resultado.error.mensaje);
    }
  };

  const pedirConfirmacion = (provincia: Provincia) => {
    Alert.alert(
      'Eliminar provincia',
      `¿Seguro que deseas eliminar «${provincia.prov_nombres}»? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(provincia) },
      ]
    );
  };

  let contenido;
  if (error) {
    contenido = <ErrorConReintento mensaje={error} onReintentar={() => cargar(consulta)} />;
  } else if (cargando && provincias.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={provincias}
        keyExtractor={(p) => String(p.prov_id)}
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.prov_nombres}
            subtitulo={`Código: ${item.prov_codigo}`}
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
            <EstadoVacio mensaje="Aún no hay provincias" detalle="Pulsa + para agregar la primera." />
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

      <BotonFlotante onPress={() => navigation.navigate('FormProvincia')} />
    </Raiz>
  );
}