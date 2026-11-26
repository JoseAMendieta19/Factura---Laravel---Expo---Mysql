import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import BotonPrincipal from './BotonPrincipal';

const Centro = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const Mensaje = styled.Text`
  font-size: 16px;
  color: ${colores.texto};
  text-align: center;
  margin-top: 12px;
`;

const Detalle = styled.Text`
  font-size: 14px;
  color: ${colores.textoSecundario};
  text-align: center;
  margin-top: 6px;
`;

const Reintento = styled.View`
  margin-top: 16px;
  align-self: stretch;
`;

export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <Centro>
      <ActivityIndicator size="large" color={colores.primario} />
      <Mensaje>{texto}</Mensaje>
    </Centro>
  );
}

export function EstadoVacio({ mensaje, detalle }: { mensaje: string; detalle?: string }) {
  return (
    <Centro>
      <Mensaje>{mensaje}</Mensaje>
      {!!detalle && <Detalle>{detalle}</Detalle>}
    </Centro>
  );
}

export function ErrorConReintento({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) {
  return (
    <Centro>
      <Mensaje>{mensaje}</Mensaje>
      <Reintento>
        <BotonPrincipal texto="Reintentar" onPress={onReintentar} />
      </Reintento>
    </Centro>
  );
}