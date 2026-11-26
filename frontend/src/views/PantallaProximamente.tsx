import styled from 'styled-components/native';
import { EstadoVacio } from '../components/Estados';
import { colores } from '../styles/comunes';

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

// Pantalla provisional: el título lo pone el encabezado del navegador.
export default function PantallaProximamente() {
  return (
    <Raiz>
      <EstadoVacio
        mensaje="Pantalla en construcción"
        detalle="Se desarrolla en los pasos siguientes."
      />
    </Raiz>
  );
}