import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { Cargando, ErrorConReintento } from '../components/Estados';
import ResumenFactura from '../components/ResumenFactura';
import { compartirPdfFactura, obtenerFactura } from '../controllers/facturaController';
import type { Factura } from '../models/Factura';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';
import type { Totales } from '../utils/calculos';
import { formatoFechaCorta } from '../utils/fechas';
import { aCentavos, formatoDinero } from '../utils/formato';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleFactura'>;

const Cabecera = styled.View`
  background-color: ${colores.primarioClaro};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 14px;
`;

const Numero = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colores.primarioOscuro};
`;

const Fecha = styled.Text`
  font-size: 15px;
  color: ${colores.texto};
  margin-top: 2px;
`;

const Seccion = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.textoSecundario};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 8px 0 10px 2px;
`;

const Tarjeta = styled.View`
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${colores.borde};
  padding: 14px;
  margin-bottom: 14px;
`;

const Nombre = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

const Dato = styled.Text`
  font-size: 14px;
  color: ${colores.textoSecundario};
  margin-top: 3px;
`;

const Linea = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colores.superficie};
  border-radius: 10px;
  border-width: 1px;
  border-color: ${colores.borde};
  padding: 12px;
  margin-bottom: 8px;
`;

const TextosLinea = styled.View`
  flex: 1;
  margin-right: 8px;
`;

const NombreLinea = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.texto};
`;

const DetalleLinea = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin-top: 2px;
`;

const TotalLinea = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.texto};
`;

export default function DetalleFacturaView({ route }: Props) {
  const { facId } = route.params;

  const [factura, setFactura] = useState<Factura | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const enviando = useRef(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    const resultado = await obtenerFactura(facId);
    if (resultado.ok) setFactura(resultado.datos);
    else setError(resultado.error.mensaje);

    setCargando(false);
  }, [facId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const compartir = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGenerando(true);

    const resultado = await compartirPdfFactura(facId);

    enviando.current = false;
    setGenerando(false);

    if (!resultado.ok) {
      Alert.alert('No se pudo generar el PDF', resultado.error.mensaje);
    }
  };

  if (cargando) return <Cargando texto="Cargando la factura..." />;
  if (error || !factura) {
    return <ErrorConReintento mensaje={error ?? 'No se pudo cargar la factura.'} onReintentar={cargar} />;
  }

  // Los valores ya vienen calculados y guardados: aquí solo se muestran, no se recalculan.
  const subtotal = aCentavos(factura.fac_subtotal);
  const descuento = aCentavos(factura.fac_descuento);
  const totales: Totales = {
    subtotal,
    descuento,
    base: subtotal - descuento,
    iva: aCentavos(factura.iva_monto),
    total: aCentavos(factura.fac_total),
  };

  return (
    <ContenedorFormulario>
      <Cabecera>
        <Numero>{factura.fac_numero}</Numero>
        <Fecha>Fecha: {formatoFechaCorta(factura.fac_fecha)}</Fecha>
      </Cabecera>

      <Seccion>Cliente</Seccion>
      <Tarjeta>
        <Nombre>{factura.cliente?.cli_nombres ?? 'Sin datos del cliente'}</Nombre>
        {!!factura.cliente?.cli_cedula && <Dato>Cédula: {factura.cliente.cli_cedula}</Dato>}
        {!!factura.cliente?.cli_correo && <Dato>Correo: {factura.cliente.cli_correo}</Dato>}
        {!!factura.cliente?.cli_telefono && <Dato>Teléfono: {factura.cliente.cli_telefono}</Dato>}
        {!!factura.cliente?.cli_direccion && <Dato>Dirección: {factura.cliente.cli_direccion}</Dato>}
      </Tarjeta>

      <Seccion>Vendedor</Seccion>
      <Tarjeta>
        <Nombre>{factura.vendedor?.vend_nombre ?? 'Sin datos del vendedor'}</Nombre>
        {!!factura.vendedor?.vend_codigo && <Dato>Código: {factura.vendedor.vend_codigo}</Dato>}
      </Tarjeta>

      <Seccion>Productos</Seccion>
      {(factura.detalles ?? []).map((d) => (
        <Linea key={d.det_fac_id}>
          <TextosLinea>
            <NombreLinea numberOfLines={2}>{d.producto?.produc_nombre ?? `Producto #${d.produc_id}`}</NombreLinea>
            <DetalleLinea>
              {d.producto ? `${d.producto.produc_serie} · ` : ''}
              {d.det_fac_cant} × {formatoDinero(d.det_fac_precio_unitario)}
            </DetalleLinea>
          </TextosLinea>
          <TotalLinea>{formatoDinero(d.det_fac_total)}</TotalLinea>
        </Linea>
      ))}

      <Seccion>Resumen</Seccion>
      <ResumenFactura
        totales={totales}
        porcentaje={factura.iva ? Number(factura.iva.iva_valor) : null}
        mostrarNota={false}
      />

      <BotonPrincipal texto="Compartir PDF" cargando={generando} onPress={compartir} />
    </ContenedorFormulario>
  );
}