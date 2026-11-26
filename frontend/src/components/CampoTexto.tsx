import { type TextInputProps } from 'react-native';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

interface Props extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  error?: string | null;
  obligatorio?: boolean;
  /** Se aplica a cada carácter que se escribe (filtrarDigitos, filtrarLetras...). */
  filtro?: (texto: string) => string;
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

const Entrada = styled.TextInput<{ $error: boolean }>`
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${({ $error }) => ($error ? colores.error : colores.borde)};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  color: ${colores.texto};
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 4px;
`;

export default function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  error,
  obligatorio,
  filtro,
  maxLength = 45,
  ...resto
}: Props) {
  return (
    <Contenedor>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Etiqueta>
      <Entrada
        {...resto}
        value={valor}
        onChangeText={(texto) => onCambio(filtro ? filtro(texto) : texto)}
        maxLength={maxLength}
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel={etiqueta}
        $error={!!error}
      />
      {!!error && <TextoError>{error}</TextoError>}
    </Contenedor>
  );
}