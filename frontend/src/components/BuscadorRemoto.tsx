import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import type { Resultado } from '../utils/resultado';
import Buscador from './Buscador';

interface Props<T> {
  etiqueta: string;
  placeholder: string;
  buscar: (texto: string) => Promise<Resultado<T[]>>;
  clave: (item: T) => string;
  titulo: (item: T) => string;
  detalle: (item: T) => string;
  /** Si devuelve un texto, la opción se muestra atenuada con ese motivo y no se puede elegir. */
  bloqueo?: (item: T) => string | null;
  onElegir: (item: T) => void;
  /** Vacía el buscador después de elegir (útil para agregar varios productos seguidos). */
  limpiarAlElegir?: boolean;
  maxResultados?: number;
  obligatorio?: boolean;
  error?: string | null;
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

const FilaAviso = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const Aviso = styled.Text`
  font-size: 14px;
  color: ${colores.textoSecundario};
  margin-left: 4px;
  margin-bottom: 6px;
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 4px;
`;

const Opcion = styled.Pressable<{ $bloqueada: boolean }>`
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${colores.borde};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 6px;
  opacity: ${({ $bloqueada }) => ($bloqueada ? 0.5 : 1)};
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

export default function BuscadorRemoto<T>({
  etiqueta,
  placeholder,
  buscar,
  clave,
  titulo,
  detalle,
  bloqueo,
  onElegir,
  limpiarAlElegir = false,
  maxResultados = 6,
  obligatorio,
  error,
}: Props<T>) {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<T[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const [consultado, setConsultado] = useState('');

  const peticion = useRef(0);
  // La función de búsqueda se guarda en un ref para que un cambio del padre no reinicie la espera.
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    const consulta = texto.trim();
    const numero = ++peticion.current;

    if (consulta.length < 2) {
      setResultados([]);
      setFallo(null);
      setBuscando(false);
      setConsultado('');
      return;
    }

    setBuscando(true);
    const temporizador = setTimeout(async () => {
      const resultado = await buscarRef.current(consulta);

      // Si mientras tanto se escribió otra cosa, esta respuesta se descarta.
      if (numero !== peticion.current) return;

      if (resultado.ok) {
        setResultados(resultado.datos.slice(0, maxResultados));
        setFallo(null);
      } else {
        setResultados([]);
        setFallo(resultado.error.mensaje);
      }
      setConsultado(consulta);
      setBuscando(false);
    }, 400);

    return () => clearTimeout(temporizador);
  }, [texto, maxResultados]);

  const elegir = (item: T) => {
    onElegir(item);
    if (limpiarAlElegir) setTexto('');
  };

  return (
    <Contenedor>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Etiqueta>

      <Buscador valor={texto} onCambio={setTexto} placeholder={placeholder} />

      {texto.trim().length === 1 && <Aviso>Escribe al menos 2 caracteres.</Aviso>}

      {buscando && (
        <FilaAviso>
          <ActivityIndicator color={colores.primario} />
          <Aviso>Buscando...</Aviso>
        </FilaAviso>
      )}

      {!buscando && !!fallo && <TextoError>{fallo}</TextoError>}

      {!buscando && !fallo && consultado !== '' && resultados.length === 0 && (
        <Aviso>Sin resultados para «{consultado}».</Aviso>
      )}

      {!buscando &&
        resultados.map((item) => {
          const motivo = bloqueo ? bloqueo(item) : null;

          return (
            <Opcion
              key={clave(item)}
              $bloqueada={!!motivo}
              disabled={!!motivo}
              onPress={() => elegir(item)}
              accessibilityRole="button"
            >
              <TituloOpcion numberOfLines={1}>{titulo(item)}</TituloOpcion>
              <DetalleOpcion numberOfLines={1}>{detalle(item)}</DetalleOpcion>
              {!!motivo && <Motivo>{motivo}</Motivo>}
            </Opcion>
          );
        })}

      {!!error && <TextoError>{error}</TextoError>}
    </Contenedor>
  );
}