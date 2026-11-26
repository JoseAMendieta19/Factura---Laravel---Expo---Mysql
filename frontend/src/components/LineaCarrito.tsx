import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import { aCentavos, deCentavos, formatoDinero } from '../utils/formato';

interface Props {
  nombre: string;
  serie: string;
  /** Precio unitario tal como lo entrega la API: "2.50". */
  precio: string;
  cantidad: number;
  stock: number;
  onMas: () => void;
  onMenos: () => void;
  onQuitar: () => void;
  error?: string | null;
}

const Tarjeta = styled.View<{ $error: boolean }>`
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ $error }) => ($error ? colores.error : colores.borde)};
  padding: 12px;
  margin-bottom: 10px;
`;

const Cabecera = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Textos = styled.View`
  flex: 1;
`;

const Nombre = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.texto};
`;

const Detalle = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

const Quitar = styled.Pressable`
  padding: 6px;
`;

const Fila = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const Controles = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Boton = styled.Pressable<{ $inactivo: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  background-color: ${colores.primarioClaro};
  align-items: center;
  justify-content: center;
  opacity: ${({ $inactivo }) => ($inactivo ? 0.4 : 1)};
`;

const Cantidad = styled.Text`
  min-width: 44px;
  text-align: center;
  font-size: 17px;
  font-weight: bold;
  color: ${colores.texto};
`;

const TotalLinea = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 8px;
`;

export default function LineaCarrito({
  nombre,
  serie,
  precio,
  cantidad,
  stock,
  onMas,
  onMenos,
  onQuitar,
  error,
}: Props) {
  const total = deCentavos(aCentavos(precio) * cantidad);
  const noBaja = cantidad <= 1;
  const noSube = cantidad >= stock;

  return (
    <Tarjeta $error={!!error}>
      <Cabecera>
        <Textos>
          <Nombre numberOfLines={1}>{nombre}</Nombre>
          <Detalle numberOfLines={1}>
            {serie} · {formatoDinero(precio)} c/u · Stock: {stock}
          </Detalle>
        </Textos>
        <Quitar onPress={onQuitar} hitSlop={8} accessibilityLabel={`Quitar ${nombre}`}>
          <Ionicons name="trash-outline" size={22} color={colores.error} />
        </Quitar>
      </Cabecera>

      <Fila>
        <Controles>
          <Boton $inactivo={noBaja} disabled={noBaja} onPress={onMenos} accessibilityLabel="Disminuir cantidad">
            <Ionicons name="remove" size={22} color={colores.primario} />
          </Boton>
          <Cantidad>{cantidad}</Cantidad>
          <Boton $inactivo={noSube} disabled={noSube} onPress={onMas} accessibilityLabel="Aumentar cantidad">
            <Ionicons name="add" size={22} color={colores.primario} />
          </Boton>
        </Controles>
        <TotalLinea>{formatoDinero(total)}</TotalLinea>
      </Fila>

      {!!error && <TextoError>{error}</TextoError>}
    </Tarjeta>
  );
}