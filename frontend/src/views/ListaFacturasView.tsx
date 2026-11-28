import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Buscador from '../components/Buscador';
import CampoFecha from '../components/CampoFecha';
import { Cargando, ErrorConReintento, EstadoVacio } from '../components/Estados';
import TarjetaLista from '../components/TarjetaLista';
import { cargarFacturas, type FiltrosFacturas } from '../controllers/facturaController';
import type { Factura, ResumenFacturas } from '../models/Factura';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';
import { formatoFechaCorta, hoyISO } from '../utils/fechas';
import { formatoDinero } from '../utils/formato';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaFacturas'>;

const Raiz = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const Filtros = styled.View`
  padding: 16px 16px 0 16px;
`;

const FilaFechas = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const ColumnaFecha = styled.View`
  flex: 1;
`;

const Limpiar = styled.Pressable`
  align-self: flex-start;
  padding: 4px 0 10px 0;
`;

const TextoLimpiar = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colores.primario};
`;

const BarraResumen = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${colores.primarioClaro};
  padding: 12px 16px;
`;

const TextoResumen = styled.Text`
  font-size: 15px;
  color: ${colores.texto};
`;

const TotalResumen = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.primarioOscuro};
`;

export default function ListaFacturasView({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [resumen, setResumen] = useState<ResumenFacturas | null>(null);
  const [busqueda, setBusqueda] = useState(''); // lo que se escribe
  const [consulta, setConsulta] = useState(''); // lo que se envía al servidor (con retraso)
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peticion = useRef(0);
  const hoy = hoyISO();

  const cargar = useCallback(async (filtros: FiltrosFacturas, modo: 'normal' | 'refrescar' = 'normal') => {
    const numero = ++peticion.current;
    if (modo === 'refrescar') setRefrescando(true);
    else setCargando(true);
    setError(null);

    const resultado = await cargarFacturas(filtros);

    // Si mientras tanto se lanzó una petición más nueva, esta respuesta se descarta.
    if (numero !== peticion.current) return;

    if (resultado.ok) {
      setFacturas(resultado.datos.facturas);
      setResumen(resultado.datos.resumen);
    } else {
      setError(resultado.error.mensaje);
    }

    setCargando(false);
    setRefrescando(false);
  }, []);

  // Espera 400 ms sin teclear antes de buscar en el servidor.
  useEffect(() => {
    const temporizador = setTimeout(() => setConsulta(busqueda.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  // Se ejecuta al entrar a la pantalla (así aparece la factura recién creada) y cuando cambia algún filtro.
  useFocusEffect(
    useCallback(() => {
      cargar({ buscar: consulta, desde, hasta });
    }, [cargar, consulta, desde, hasta])
  );

  const hayFiltros = consulta !== '' || desde !== '' || hasta !== '';

  let contenido;
  if (error) {
    contenido = (
      <ErrorConReintento mensaje={error} onReintentar={() => cargar({ buscar: consulta, desde, hasta })} />
    );
  } else if (cargando && facturas.length === 0) {
    contenido = <Cargando />;
  } else {
    contenido = (
      <FlatList
        data={facturas}
        keyExtractor={(f) => String(f.fac_id)}
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.fac_numero}
            subtitulo={`${item.cliente?.cli_nombres ?? 'Sin cliente'} · ${formatoFechaCorta(item.fac_fecha)}`}
            detalle={`Total: ${formatoDinero(item.fac_total)}`}
            onPress={() => navigation.navigate('DetalleFactura', { facId: item.fac_id })}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom, flexGrow: 1 }}
        refreshing={refrescando}
        onRefresh={() => cargar({ buscar: consulta, desde, hasta }, 'refrescar')}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          hayFiltros ? (
            <EstadoVacio
              mensaje="Sin resultados"
              detalle="Prueba con otro número, cliente o rango de fechas."
            />
          ) : (
            <EstadoVacio
              mensaje="Aún no hay facturas"
              detalle="Las facturas que registres desde «Nueva factura» aparecerán aquí."
            />
          )
        }
      />
    );
  }

  return (
    <Raiz>
      <Filtros>
        <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por número o cliente..." />

        <FilaFechas>
          <ColumnaFecha>
            <CampoFecha
              etiqueta="Desde"
              valor={desde}
              onCambio={setDesde}
              maximo={hasta || hoy}
              permitirBorrar
            />
          </ColumnaFecha>
          <ColumnaFecha>
            <CampoFecha
              etiqueta="Hasta"
              valor={hasta}
              onCambio={setHasta}
              minimo={desde || undefined}
              maximo={hoy}
              permitirBorrar
            />
          </ColumnaFecha>
        </FilaFechas>

        {(desde !== '' || hasta !== '') && (
          <Limpiar
            onPress={() => {
              setDesde('');
              setHasta('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Limpiar fechas"
          >
            <TextoLimpiar>Limpiar fechas</TextoLimpiar>
          </Limpiar>
        )}
      </Filtros>

      {resumen && !error && (
        <BarraResumen>
          <TextoResumen>
            {resumen.cantidad} {resumen.cantidad === 1 ? 'factura' : 'facturas'}
          </TextoResumen>
          <TotalResumen>Total: {formatoDinero(resumen.total)}</TotalResumen>
        </BarraResumen>
      )}

      {contenido}
    </Raiz>
  );
}