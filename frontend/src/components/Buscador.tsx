import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

interface Props {
  valor: string;
  onCambio: (texto: string) => void;
  placeholder?: string;
}

const Caja = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${colores.borde};
  border-radius: 10px;
  padding: 0 12px;
  margin-bottom: 12px;
`;

const Entrada = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${colores.texto};
  padding: 12px 8px;
`;

export default function Buscador({ valor, onCambio, placeholder = 'Buscar...' }: Props) {
  return (
    <Caja>
      <Ionicons name="search-outline" size={20} color={colores.textoSecundario} />
      <Entrada
        value={valor}
        onChangeText={onCambio}
        placeholder={placeholder}
        placeholderTextColor={colores.textoSecundario}
        maxLength={100}
        returnKeyType="search"
        autoCorrect={false}
      />
      {valor.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color={colores.textoSecundario}
          onPress={() => onCambio('')}
          accessibilityLabel="Limpiar búsqueda"
        />
      )}
    </Caja>
  );
}