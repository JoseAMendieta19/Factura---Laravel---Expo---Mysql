import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Segunda línea opcional (por ejemplo, el vencimiento de un producto). */
  detalle?: string;
  /** Pinta el detalle en rojo. */
  detalleAlerta?: boolean;
  onPress?: () => void;
  onEditar?: () => void;
  onEliminar?: () => void;
}

const Tarjeta = styled.Pressable`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${colores.borde};
  padding: 14px;
  margin-bottom: 10px;
`;

const Textos = styled.View`
  flex: 1;
`;

const Titulo = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

const Subtitulo = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

const Detalle = styled.Text<{ $alerta: boolean }>`
  font-size: 13px;
  font-weight: ${({ $alerta }) => ($alerta ? 'bold' : 'normal')};
  color: ${({ $alerta }) => ($alerta ? colores.error : colores.textoSecundario)};
  margin-top: 2px;
`;

const Accion = styled.Pressable`
  padding: 8px;
  margin-left: 4px;
`;

export default function TarjetaLista({
  titulo,
  subtitulo,
  detalle,
  detalleAlerta = false,
  onPress,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <Tarjeta onPress={onPress}>
      <Textos>
        <Titulo numberOfLines={1}>{titulo}</Titulo>
        {!!subtitulo && <Subtitulo numberOfLines={1}>{subtitulo}</Subtitulo>}
        {!!detalle && (
          <Detalle numberOfLines={1} $alerta={detalleAlerta}>
            {detalle}
          </Detalle>
        )}
      </Textos>

      {onEditar && (
        <Accion onPress={onEditar} hitSlop={8} accessibilityLabel="Editar">
          <Ionicons name="create-outline" size={22} color={colores.primario} />
        </Accion>
      )}
      {onEliminar && (
        <Accion onPress={onEliminar} hitSlop={8} accessibilityLabel="Eliminar">
          <Ionicons name="trash-outline" size={22} color={colores.error} />
        </Accion>
      )}
    </Tarjeta>
  );
}