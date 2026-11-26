import { Picker } from '@react-native-picker/picker';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

export interface OpcionSelector {
  valor: number;
  etiqueta: string;
}

interface Props {
  etiqueta: string;
  valor: number | null;
  opciones: OpcionSelector[];
  onCambio: (valor: number | null) => void;
  error?: string | null;
  obligatorio?: boolean;
  placeholder?: string;
  deshabilitado?: boolean;
}

// Los ids de la base son positivos, así que -1 representa "sin selección".
const SIN_SELECCION = -1;

const Contenedor = styled.View`
  margin-bottom: 14px;
`;

const Etiqueta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.texto};
  margin-bottom: 6px;
`;

const Caja = styled.View<{ $error: boolean }>`
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${({ $error }) => ($error ? colores.error : colores.borde)};
  border-radius: 8px;
  overflow: hidden;
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 4px;
`;

export default function CampoSelector({
  etiqueta,
  valor,
  opciones,
  onCambio,
  error,
  obligatorio,
  placeholder = 'Selecciona una opción',
  deshabilitado = false,
}: Props) {
  return (
    <Contenedor>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Etiqueta>

      <Caja $error={!!error}>
        <Picker<number>
          selectedValue={valor ?? SIN_SELECCION}
          onValueChange={(elegido) => onCambio(elegido === SIN_SELECCION ? null : elegido)}
          enabled={!deshabilitado}
          prompt={etiqueta}
          dropdownIconColor={colores.texto}
          style={{ color: colores.texto }}
        >
          <Picker.Item label={placeholder} value={SIN_SELECCION} color={colores.textoSecundario} />
          {opciones.map((opcion) => (
            <Picker.Item key={opcion.valor} label={opcion.etiqueta} value={opcion.valor} />
          ))}
        </Picker>
      </Caja>

      {!!error && <TextoError>{error}</TextoError>}
    </Contenedor>
  );
}