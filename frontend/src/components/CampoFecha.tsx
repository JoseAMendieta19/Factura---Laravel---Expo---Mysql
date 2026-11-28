import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { colores } from '../styles/comunes';
import {
  ENCABEZADO_SEMANA,
  NOMBRES_MESES,
  aISO,
  construirMes,
  diaDeshabilitado,
  mesAccesible,
  mesInicial,
  moverMes,
} from '../utils/calendario';
import { formatoFechaCorta, hoyISO } from '../utils/fechas';
import BotonPrincipal from './BotonPrincipal';

interface Props {
  etiqueta: string;
  /** Fecha elegida en formato AAAA-MM-DD, o '' si no hay. */
  valor: string;
  /** Se llama con la fecha elegida (AAAA-MM-DD) o con '' si se borra. */
  onCambio: (iso: string) => void;
  error?: string | null;
  obligatorio?: boolean;
  /** Los días anteriores a esta fecha (AAAA-MM-DD) no se pueden elegir. */
  minimo?: string;
  /** Los días posteriores a esta fecha (AAAA-MM-DD) no se pueden elegir. */
  maximo?: string;
  placeholder?: string;
  /** Muestra el botón "Borrar fecha" (para filtros opcionales). */
  permitirBorrar?: boolean;
  deshabilitado?: boolean;
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

const Campo = styled.Pressable<{ $error: boolean; $inactivo: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-width: 1px;
  border-color: ${({ $error }) => ($error ? colores.error : colores.borde)};
  border-radius: 8px;
  padding: 12px;
  min-height: 48px;
  opacity: ${({ $inactivo }) => ($inactivo ? 0.5 : 1)};
`;

const TextoValor = styled.Text`
  flex: 1;
  font-size: 16px;
  color: ${colores.texto};
`;

const TextoPlaceholder = styled.Text`
  flex: 1;
  font-size: 16px;
  color: ${colores.textoSecundario};
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-top: 4px;
`;

const Fondo = styled.View`
  flex: 1;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.45);
`;

// Cubre todo el fondo: tocarlo cierra el calendario.
const Cierre = styled.Pressable`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Tarjeta = styled.View`
  background-color: ${colores.superficie};
  border-radius: 14px;
  padding: 16px;
`;

const Titulo = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.textoSecundario};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const Navegacion = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const BotonNav = styled.Pressable<{ $inactivo: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colores.primarioClaro};
  align-items: center;
  justify-content: center;
  opacity: ${({ $inactivo }) => ($inactivo ? 0.35 : 1)};
`;

const TextoNav = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colores.primario};
  line-height: 26px;
`;

const TituloMes = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: bold;
  color: ${colores.texto};
`;

const FilaSemana = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const TextoSemana = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  color: ${colores.textoSecundario};
`;

const FilaDias = styled.View`
  flex-direction: row;
`;

const CeldaDia = styled.Pressable`
  flex: 1;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const CeldaVacia = styled.View`
  flex: 1;
  height: 44px;
`;

const Circulo = styled.View<{ $seleccionado: boolean; $hoy: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $seleccionado }) => ($seleccionado ? colores.primario : 'transparent')};
  border-width: ${({ $hoy, $seleccionado }) => ($hoy && !$seleccionado ? '1.5px' : '0px')};
  border-color: ${colores.primario};
`;

const TextoDia = styled.Text<{ $seleccionado: boolean; $inactivo: boolean }>`
  font-size: 15px;
  font-weight: ${({ $seleccionado }) => ($seleccionado ? 'bold' : 'normal')};
  color: ${({ $seleccionado, $inactivo }) =>
    $seleccionado ? colores.blanco : $inactivo ? colores.textoSecundario : colores.texto};
  opacity: ${({ $inactivo }) => ($inactivo ? 0.35 : 1)};
`;

const Acciones = styled.View`
  margin-top: 14px;
  gap: 8px;
`;

export default function CampoFecha({
  etiqueta,
  valor,
  onCambio,
  error,
  obligatorio,
  minimo,
  maximo,
  placeholder = 'Seleccionar fecha',
  permitirBorrar = false,
  deshabilitado = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState({ anio: 2026, mes: 1 });

  // Se calcula en cada render: si la pantalla queda abierta pasada la medianoche, "hoy" se actualiza.
  const hoy = hoyISO();

  const abrir = () => {
    setVisible(mesInicial(valor, minimo, maximo, hoy));
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const elegir = (iso: string) => {
    setAbierto(false);
    onCambio(iso);
  };

  const destino = (delta: number) => moverMes(visible.anio, visible.mes, delta);
  const puedeMover = (delta: number): boolean => {
    const d = destino(delta);
    return mesAccesible(d.anio, d.mes, minimo, maximo);
  };
  const mover = (delta: number) => {
    if (puedeMover(delta)) setVisible(destino(delta));
  };

  const filas = construirMes(visible.anio, visible.mes);
  const nombreMes = NOMBRES_MESES[visible.mes - 1];

  const botonNav = (texto: string, delta: number, descripcion: string) => (
    <BotonNav
      $inactivo={!puedeMover(delta)}
      disabled={!puedeMover(delta)}
      onPress={() => mover(delta)}
      accessibilityLabel={descripcion}
    >
      <TextoNav>{texto}</TextoNav>
    </BotonNav>
  );

  return (
    <Contenedor>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Etiqueta>

      <Campo
        $error={!!error}
        $inactivo={deshabilitado}
        disabled={deshabilitado}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
      >
        {valor ? (
          <TextoValor>{formatoFechaCorta(valor)}</TextoValor>
        ) : (
          <TextoPlaceholder>{placeholder}</TextoPlaceholder>
        )}
        <Ionicons name="calendar-outline" size={22} color={colores.textoSecundario} />
      </Campo>

      {!!error && <TextoError>{error}</TextoError>}

      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={cerrar}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <Fondo style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}>
          <Cierre onPress={cerrar} accessibilityLabel="Cerrar calendario" />

          <Tarjeta>
            <Titulo>{etiqueta}</Titulo>

            <Navegacion>
              {botonNav('«', -12, 'Año anterior')}
              {botonNav('‹', -1, 'Mes anterior')}
              <TituloMes>
                {nombreMes} {visible.anio}
              </TituloMes>
              {botonNav('›', 1, 'Mes siguiente')}
              {botonNav('»', 12, 'Año siguiente')}
            </Navegacion>

            <FilaSemana>
              {ENCABEZADO_SEMANA.map((dia) => (
                <TextoSemana key={dia}>{dia}</TextoSemana>
              ))}
            </FilaSemana>

            {filas.map((fila, i) => (
              <FilaDias key={i}>
                {fila.map((dia, j) => {
                  if (dia === null) return <CeldaVacia key={j} />;

                  const iso = aISO(visible.anio, visible.mes, dia);
                  const inactivo = diaDeshabilitado(iso, minimo, maximo);
                  const seleccionado = iso === valor;

                  return (
                    <CeldaDia
                      key={j}
                      disabled={inactivo}
                      onPress={() => elegir(iso)}
                      accessibilityLabel={`${dia} de ${nombreMes} de ${visible.anio}`}
                    >
                      <Circulo $seleccionado={seleccionado} $hoy={iso === hoy}>
                        <TextoDia $seleccionado={seleccionado} $inactivo={inactivo}>
                          {dia}
                        </TextoDia>
                      </Circulo>
                    </CeldaDia>
                  );
                })}
              </FilaDias>
            ))}

            <Acciones>
              <BotonPrincipal
                texto="Hoy"
                onPress={() => elegir(hoy)}
                deshabilitado={diaDeshabilitado(hoy, minimo, maximo)}
              />
              {permitirBorrar && valor !== '' && (
                <BotonPrincipal texto="Borrar fecha" variante="peligro" onPress={() => elegir('')} />
              )}
              <BotonPrincipal texto="Cancelar" variante="secundario" onPress={cerrar} />
            </Acciones>
          </Tarjeta>
        </Fondo>
      </Modal>
    </Contenedor>
  );
}