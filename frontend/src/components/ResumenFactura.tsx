import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import type { Totales } from '../utils/calculos';
import { deCentavos, formatoDinero } from '../utils/formato';

interface Props {
  totales: Totales;
  /** Porcentaje de la tarifa elegida (15), o null si todavía no se eligió. */
  porcentaje: number | null;
}

const Caja = styled.View`
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${colores.borde};
  padding: 14px;
  margin-bottom: 16px;
`;

const Fila = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const Etiqueta = styled.Text`
  font-size: 15px;
  color: ${colores.textoSecundario};
`;

const Valor = styled.Text`
  font-size: 15px;
  color: ${colores.texto};
`;

const FilaTotal = styled.View`
  flex-direction: row;
  justify-content: space-between;
  border-top-width: 1px;
  border-top-color: ${colores.borde};
  padding-top: 10px;
  margin-top: 4px;
`;

const EtiquetaTotal = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colores.texto};
`;

const ValorTotal = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colores.primarioOscuro};
`;

const Nota = styled.Text`
  font-size: 12px;
  color: ${colores.textoSecundario};
  margin-top: 8px;
`;

const dinero = (centavos: number): string => formatoDinero(deCentavos(centavos));

export default function ResumenFactura({ totales, porcentaje }: Props) {
  return (
    <Caja>
      <Fila>
        <Etiqueta>Subtotal</Etiqueta>
        <Valor>{dinero(totales.subtotal)}</Valor>
      </Fila>
      <Fila>
        <Etiqueta>Descuento</Etiqueta>
        <Valor>{totales.descuento > 0 ? `-${dinero(totales.descuento)}` : dinero(0)}</Valor>
      </Fila>
      <Fila>
        <Etiqueta>{porcentaje === null ? 'IVA' : `IVA (${porcentaje}%)`}</Etiqueta>
        <Valor>{dinero(totales.iva)}</Valor>
      </Fila>
      <FilaTotal>
        <EtiquetaTotal>Total</EtiquetaTotal>
        <ValorTotal>{dinero(totales.total)}</ValorTotal>
      </FilaTotal>
      <Nota>El IVA se calcula sobre el subtotal menos el descuento. El total definitivo lo confirma el servidor.</Nota>
    </Caja>
  );
}