import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

interface Props {
  onPress: () => void;
}

const Boton = styled.Pressable<{ $abajo: number; $derecha: number }>`
  position: absolute;
  right: ${({ $derecha }) => $derecha}px;
  bottom: ${({ $abajo }) => $abajo}px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${colores.primario};
  align-items: center;
  justify-content: center;
  elevation: 6;
  shadow-color: #000000;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const Signo = styled.Text`
  color: ${colores.blanco};
  font-size: 32px;
  line-height: 36px;
`;

export default function BotonFlotante({ onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Boton
      $abajo={24 + insets.bottom}
      $derecha={20 + insets.right}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Agregar nuevo"
    >
      <Signo>+</Signo>
    </Boton>
  );
}