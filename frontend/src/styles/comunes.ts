import styled from 'styled-components/native';

export const colores = {
  primario: '#2f6f4f',
  primarioOscuro: '#1f4d36',
  primarioClaro: '#e3eee8',
  fondo: '#f3f6f4',
  superficie: '#ffffff',
  texto: '#1f2d26',
  textoSecundario: '#5f6f66',
  borde: '#c5d2ca',
  error: '#c0392b',
  exito: '#2e7d4f',
  blanco: '#ffffff',
};

export const Pantalla = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
  padding: 24px;
  justify-content: center;
`;

export const Titulo = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colores.texto};
  margin-bottom: 12px;
`;

export const Texto = styled.Text`
  font-size: 15px;
  color: ${colores.texto};
  margin-bottom: 8px;
`;

export const Boton = styled.Pressable`
  background-color: ${colores.primario};
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  margin-top: 16px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const TextoBoton = styled.Text`
  color: ${colores.blanco};
  font-size: 16px;
  font-weight: bold;
`;

export const MensajeExito = styled.Text`
  margin-top: 20px;
  font-size: 15px;
  color: ${colores.exito};
`;

export const MensajeError = styled.Text`
  margin-top: 20px;
  font-size: 15px;
  color: ${colores.error};
`;