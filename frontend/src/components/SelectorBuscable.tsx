import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import type { Resultado } from '../utils/resultado';
import Buscador from './Buscador';
import { Cargando, ErrorConReintento, EstadoVacio } from './Estados';

interface Props<T> {
  etiqueta: string;
  placeholder: string;
  /** Elemento elegido (se muestra en el campo). Con null, el campo muestra el placeholder. */
  valor: T | null;
  /** Se llama con '' al abrir (lista completa) y con el texto escrito al buscar. */
  cargar: (texto: string) => Promise<Resultado<T[]>>;
  clave: (item: T) => string;
  titulo: (item: T) => string;
  detalle: (item: T) => string;
  /** Si devuelve un texto, la opción se muestra atenuada con ese motivo y no se puede elegir. */
  bloqueo?: (item: T) => string | null;
  onElegir: (item: T) => void;
  tituloVentana?: string;
  placeholderBuscar?: string;
  obligatorio?: boolean;
  error?: string | null;
  deshabilitado?: boolean;
}

const Contenedor = styled.View`
  margin-bottom: 14px;
`;

const Etiqueta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.texto};
  margin-bottom: 6px;
`;

const Campo = styled.Pressable<{ $error: boolean; $inactivo: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${({ $error }) => ($error ? colores.error : colores.borde)};
  border-radius: 8px;
  padding: 12px;
  min-height: 52px;
  opacity: ${({ $inactivo }) => ($inactivo ? 0.5 : 1)};
`;

const TextosCampo = styled.View`
  flex: 1;
`;

const TituloCampo = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

const DetalleCampo = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

const TextoPlaceholder = styled.Text`
  font-size: 16px;
  color: ${colores.textoSecundario};
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 4px;
`;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px 16px;
`;

const TituloVentana = styled.Text`
  flex: 1;
  font-size: 18px;
  font-weight: bold;
  color: ${colores.texto};
`;

const BotonCerrar = styled.Pressable`
  padding: 6px;
`;

const CajaBuscador = styled.View`
  padding: 0 16px;
`;

const Opcion = styled.Pressable<{ $elegida: boolean; $bloqueada: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ $elegida }) => ($elegida ? colores.primarioClaro : colores.superficie)};
  border-width: 1px;
  border-color: ${({ $elegida }) => ($elegida ? colores.primario : colores.borde)};
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 8px;
  opacity: ${({ $bloqueada }) => ($bloqueada ? 0.5 : 1)};
`;

const TextosOpcion = styled.View`
  flex: 1;
`;

const TituloOpcion = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.texto};
`;

const DetalleOpcion = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

const Motivo = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.error};
  margin-top: 2px;
`;

export default function SelectorBuscable<T>({
  etiqueta,
  placeholder,
  valor,
  cargar,
  clave,
  titulo,
  detalle,
  bloqueo,
  onElegir,
  tituloVentana,
  placeholderBuscar = 'Buscar...',
  obligatorio,
  error,
  deshabilitado = false,
}: Props<T>) {
  const insets = useSafeAreaInsets();

  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(''); // lo que se escribe
  const [consulta, setConsulta] = useState(''); // lo que se envía al servidor (con retraso)
  const [items, setItems] = useState<T[]>([]);
  const [cargando, setCargando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  const peticion = useRef(0);
  // La función de carga se guarda en un ref para que un cambio del padre no dispare otra búsqueda.
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  const ejecutar = useCallback(async (q: string) => {
    const numero = ++peticion.current;
    setCargando(true);
    setFallo(null);

    const resultado = await cargarRef.current(q);

    // Si mientras tanto se escribió otra cosa (o se cerró la ventana), esta respuesta se descarta.
    if (numero !== peticion.current) return;

    if (resultado.ok) {
      setItems(resultado.datos);
    } else {
      setItems([]);
      setFallo(resultado.error.mensaje);
    }
    setCargando(false);
  }, []);

  // Espera 400 ms sin teclear antes de buscar.
  useEffect(() => {
    if (!abierto) return;
    const temporizador = setTimeout(() => setConsulta(texto.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [texto, abierto]);

  // Carga la lista al abrir (consulta vacía = todos) y cada vez que cambia la búsqueda.
  useEffect(() => {
    if (abierto) ejecutar(consulta);
  }, [abierto, consulta, ejecutar]);

  const abrir = () => {
    setTexto('');
    setConsulta('');
    setItems([]);
    setFallo(null);
    setAbierto(true);
  };

  const cerrar = () => {
    peticion.current++; // invalida cualquier respuesta pendiente
    setAbierto(false);
  };

  const elegir = (item: T) => {
    cerrar();
    onElegir(item);
  };

  let contenido;
  if (fallo) {
    contenido = <ErrorConReintento mensaje={fallo} onReintentar={() => ejecutar(consulta)} />;
  } else if (cargando && items.length === 0) {
    contenido = <Cargando texto="Cargando..." />;
  } else {
    contenido = (
      <FlatList
        data={items}
        keyExtractor={clave}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom, flexGrow: 1 }}
        ListEmptyComponent={
          consulta ? (
            <EstadoVacio mensaje={`Sin resultados para «${consulta}»`} detalle="Prueba con otro texto." />
          ) : (
            <EstadoVacio mensaje="No hay registros" />
          )
        }
        renderItem={({ item }) => {
          const motivo = bloqueo ? bloqueo(item) : null;
          const elegida = valor !== null && clave(valor) === clave(item);

          return (
            <Opcion
              $elegida={elegida}
              $bloqueada={!!motivo}
              disabled={!!motivo}
              onPress={() => elegir(item)}
              accessibilityRole="button"
            >
              <TextosOpcion>
                <TituloOpcion numberOfLines={1}>{titulo(item)}</TituloOpcion>
                <DetalleOpcion numberOfLines={1}>{detalle(item)}</DetalleOpcion>
                {!!motivo && <Motivo>{motivo}</Motivo>}
              </TextosOpcion>
              {elegida && <Ionicons name="checkmark-circle" size={22} color={colores.primario} />}
            </Opcion>
          );
        }}
      />
    );
  }

  return (
    <Contenedor>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Etiqueta>

      <Campo
        $error={!!error}
        $inactivo={deshabilitado}
        disabled={deshabilitado}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
      >
        <TextosCampo>
          {valor !== null ? (
            <>
              <TituloCampo numberOfLines={1}>{titulo(valor)}</TituloCampo>
              <DetalleCampo numberOfLines={1}>{detalle(valor)}</DetalleCampo>
            </>
          ) : (
            <TextoPlaceholder>{placeholder}</TextoPlaceholder>
          )}
        </TextosCampo>
        <Ionicons name="chevron-down" size={22} color={colores.textoSecundario} />
      </Campo>

      {!!error && <TextoError>{error}</TextoError>}

      <Modal
        visible={abierto}
        animationType="slide"
        onRequestClose={cerrar}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <Raiz style={{ paddingTop: insets.top }}>
          <Encabezado>
            <TituloVentana numberOfLines={1}>{tituloVentana ?? etiqueta}</TituloVentana>
            <BotonCerrar onPress={cerrar} hitSlop={8} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={26} color={colores.texto} />
            </BotonCerrar>
          </Encabezado>

          <CajaBuscador>
            <Buscador valor={texto} onCambio={setTexto} placeholder={placeholderBuscar} />
          </CajaBuscador>

          {contenido}
        </Raiz>
      </Modal>
    </Contenedor>
  );
}