import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

interface Props {
  texto: string;
  onPress: () => void;
  /** Muestra el indicador de carga y desactiva el botón (evita guardar dos veces). */
  cargando?: boolean;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario' | 'peligro';
}

const colorPorVariante = {
  primario: colores.primario,
  secundario: colores.textoSecundario,
  peligro: colores.error,
};

const Contenedor = styled.Pressable<{ $color: string; $inactivo: boolean }>`
  background-color: ${({ $color }) => $color};
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  opacity: ${({ $inactivo }) => ($inactivo ? 0.5 : 1)};
`;

const Texto = styled.Text`
  color: ${colores.blanco};
  font-size: 16px;
  font-weight: bold;
`;

export default function BotonPrincipal({
  texto,
  onPress,
  cargando = false,
  deshabilitado = false,
  variante = 'primario',
}: Props) {
  const inactivo = cargando || deshabilitado;

  return (
    <Contenedor
      $color={colorPorVariante[variante]}
      $inactivo={inactivo}
      disabled={inactivo}
      onPress={onPress}
      accessibilityRole="button"
    >
      {cargando ? <ActivityIndicator color={colores.blanco} /> : <Texto>{texto}</Texto>}
    </Contenedor>
  );
}