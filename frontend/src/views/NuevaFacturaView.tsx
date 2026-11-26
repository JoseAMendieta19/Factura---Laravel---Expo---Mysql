import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoSelector from '../components/CampoSelector';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { Cargando, ErrorConReintento, EstadoVacio } from '../components/Estados';
import LineaCarrito from '../components/LineaCarrito';
import ResumenFactura from '../components/ResumenFactura';
import SelectorBuscable from '../components/SelectorBuscable';
import { cargarClientes } from '../controllers/clienteController';
import { registrarFactura } from '../controllers/facturaController';
import { cargarTarifasIva } from '../controllers/ivaController';
import { cargarProductos } from '../controllers/productoController';
import { cargarVendedores } from '../controllers/vendedorController';
import type { Cliente } from '../models/Cliente';
import type { Iva } from '../models/Iva';
import type { Producto } from '../models/Producto';
import type { Vendedor } from '../models/Vendedor';
import type { RootStackParamList } from '../navigation/tipos';
import { colores } from '../styles/comunes';
import { calcularTotales, subtotalDeLineas } from '../utils/calculos';
import { esFechaPasada, formatoFechaCorta, hoyISO } from '../utils/fechas';
import { aCentavos, deCentavos, formatoDinero } from '../utils/formato';
import { filtrarDecimal } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'NuevaFactura'>;
type Errores = Record<string, string | null | undefined>;

interface LineaEstado {
  producto: Producto;
  cantidad: number;
}

const Seccion = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.textoSecundario};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 8px 0 10px 2px;
`;

const Aviso = styled.Text`
  font-size: 14px;
  color: ${colores.textoSecundario};
  margin-bottom: 14px;
`;

const CajaFecha = styled.View`
  background-color: ${colores.primarioClaro};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 14px;
`;

const EtiquetaFecha = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.texto};
`;

const ValorFecha = styled.Text`
  font-size: 16px;
  color: ${colores.texto};
  margin-top: 2px;
`;

const Espacio = styled.View`
  height: 12px;
`;

// Funciones fuera del componente: así tienen siempre la misma identidad entre renderizados.
const claveCliente = (c: Cliente) => String(c.cli_id);
const tituloCliente = (c: Cliente) => c.cli_nombres;
const detalleCliente = (c: Cliente) => `Cédula: ${c.cli_cedula}`;

const claveVendedor = (v: Vendedor) => String(v.vend_id);
const tituloVendedor = (v: Vendedor) => v.vend_nombre;
const detalleVendedor = (v: Vendedor) => `Código: ${v.vend_codigo}`;

const claveProducto = (p: Producto) => String(p.produc_id);
const tituloProducto = (p: Producto) => p.produc_nombre;
const detalleProducto = (p: Producto) =>
  `${p.produc_serie} · Stock: ${p.produc_cantidad} · ${formatoDinero(p.produc_precio)}`;

// No se pueden vender productos sin stock ni vencidos (vence hoy todavía se puede vender).
const motivoBloqueo = (p: Producto): string | null => {
  if (p.produc_cantidad <= 0) return 'Sin stock';
  if (esFechaPasada(p.produc_fecha_venci)) return `Vencido el ${formatoFechaCorta(p.produc_fecha_venci)}`;
  return null;
};

export default function NuevaFacturaView({ navigation }: Props) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [lineas, setLineas] = useState<LineaEstado[]>([]);
  const [ivaId, setIvaId] = useState<number | null>(null);
  const [descuento, setDescuento] = useState('');

  const [tarifas, setTarifas] = useState<Iva[]>([]);
  const [hayVendedores, setHayVendedores] = useState(true);
  const [cargandoCat, setCargandoCat] = useState(true);
  const [errorCat, setErrorCat] = useState<string | null>(null);

  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  const cargarCatalogos = useCallback(async () => {
    setCargandoCat(true);
    setErrorCat(null);

    const [resIva, resVend] = await Promise.all([cargarTarifasIva(''), cargarVendedores('')]);

    if (!resIva.ok) {
      setErrorCat(resIva.error.mensaje);
    } else if (!resVend.ok) {
      setErrorCat(resVend.error.mensaje);
    } else {
      setTarifas(resIva.datos);
      setHayVendedores(resVend.datos.length > 0);
      // Se preselecciona la tarifa general (15%); se puede cambiar.
      setIvaId((previo) => previo ?? resIva.datos.find((t) => Number(t.iva_valor) === 15)?.iva_id ?? null);
    }

    setCargandoCat(false);
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const quitarErrores = (...campos: string[]) =>
    setErrores((previos) => {
      const nuevos = { ...previos };
      campos.forEach((campo) => {
        nuevos[campo] = null;
      });
      return nuevos;
    });

  // Al cambiar las líneas, los índices cambian: se descartan los errores "detalles", "detalles.0.cantidad", etc.
  const limpiarErroresDetalles = () =>
    setErrores((previos) =>
      Object.fromEntries(Object.entries(previos).filter(([campo]) => !campo.startsWith('detalles')))
    );

  const agregarProducto = (producto: Producto) => {
    limpiarErroresDetalles();
    setLineas((previas) => {
      const existente = previas.find((l) => l.producto.produc_id === producto.produc_id);
      if (!existente) return [...previas, { producto, cantidad: 1 }];

      return previas.map((l) =>
        l.producto.produc_id === producto.produc_id
          ? { ...l, cantidad: Math.min(l.cantidad + 1, l.producto.produc_cantidad) }
          : l
      );
    });
  };

  const cambiarCantidad = (id: number, delta: 1 | -1) => {
    limpiarErroresDetalles();
    setLineas((previas) =>
      previas.map((l) => {
        if (l.producto.produc_id !== id) return l;
        const nueva = l.cantidad + delta;
        if (nueva < 1 || nueva > l.producto.produc_cantidad) return l;
        return { ...l, cantidad: nueva };
      })
    );
  };

  const quitarLinea = (id: number) => {
    limpiarErroresDetalles();
    setLineas((previas) => previas.filter((l) => l.producto.produc_id !== id));
  };

  // Vista previa del resumen: la misma fórmula que Laravel, en centavos enteros.
  const subtotal = useMemo(
    () => subtotalDeLineas(lineas.map((l) => ({ precio: l.producto.produc_precio, cantidad: l.cantidad }))),
    [lineas]
  );
  const tarifa = tarifas.find((t) => t.iva_id === ivaId);
  const descuentoCent = aCentavos(descuento || '0');
  const totales = calcularTotales(subtotal, descuentoCent, tarifa ? aCentavos(tarifa.iva_valor) : 0);

  const errorDescuento =
    errores.fac_descuento ??
    (descuentoCent > subtotal
      ? `El descuento no puede ser mayor que el subtotal (${formatoDinero(deCentavos(subtotal))}).`
      : null);

  const facturar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);

    const resultado = await registrarFactura({
      clienteId: cliente?.cli_id ?? null,
      vendedorId: vendedor?.vend_id ?? null,
      ivaId,
      descuento,
      lineas: lineas.map((l) => ({
        produc_id: l.producto.produc_id,
        nombre: l.producto.produc_nombre,
        precio: l.producto.produc_precio,
        stock: l.producto.produc_cantidad,
        cantidad: l.cantidad,
      })),
    });

    if (resultado.ok) {
      const factura = resultado.datos;
      // Se mantiene "guardando" hasta salir de la pantalla, para no permitir una segunda factura.
      Alert.alert(
        'Factura registrada',
        `Número: ${factura.fac_numero}\nTotal: ${formatoDinero(factura.fac_total)}`,
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
      return;
    }

    enviando.current = false;
    setGuardando(false);

    if (resultado.error.tipo === 'validacion') {
      setErrores(resultado.error.errores);
      // La fecha no tiene campo en pantalla: si el servidor la rechaza, se avisa con una alerta.
      if (resultado.error.errores.fac_fecha) {
        Alert.alert('Fecha no válida', resultado.error.errores.fac_fecha);
      }
      return;
    }

    // Sin respuesta no se sabe si el servidor llegó a guardar la factura: se advierte antes de reintentar.
    const dudoso = resultado.error.tipo === 'timeout' || resultado.error.tipo === 'sin_conexion';
    Alert.alert(
      'No se pudo registrar la factura',
      dudoso
        ? `${resultado.error.mensaje}\n\nSi el problema continúa, revisa en Facturas si la factura ya se registró antes de reintentar.`
        : resultado.error.mensaje
    );
  };

  if (cargandoCat) return <Cargando texto="Preparando la factura..." />;
  if (errorCat) return <ErrorConReintento mensaje={errorCat} onReintentar={cargarCatalogos} />;
  if (tarifas.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay tarifas de IVA registradas"
        detalle="Registra al menos una desde el módulo IVA para poder facturar."
      />
    );
  }
  if (!hayVendedores) {
    return (
      <EstadoVacio
        mensaje="No hay vendedores registrados"
        detalle="Registra al menos uno desde el módulo Vendedores para poder facturar."
      />
    );
  }

  return (
    <ContenedorFormulario>
      <Seccion>Cliente</Seccion>
      <SelectorBuscable
        etiqueta="Cliente"
        obligatorio
        placeholder="Selecciona el cliente"
        valor={cliente}
        cargar={cargarClientes}
        clave={claveCliente}
        titulo={tituloCliente}
        detalle={detalleCliente}
        onElegir={(elegido) => {
          setCliente(elegido);
          quitarErrores('cli_id');
        }}
        tituloVentana="Seleccionar cliente"
        placeholderBuscar="Buscar por nombre o cédula..."
        error={errores.cli_id}
        deshabilitado={guardando}
      />

      <Seccion>Productos</Seccion>
      <SelectorBuscable
        etiqueta="Agregar producto"
        obligatorio
        placeholder="Selecciona un producto"
        valor={null}
        cargar={cargarProductos}
        clave={claveProducto}
        titulo={tituloProducto}
        detalle={detalleProducto}
        bloqueo={motivoBloqueo}
        onElegir={agregarProducto}
        tituloVentana="Agregar producto"
        placeholderBuscar="Buscar por nombre o serie..."
        error={errores.detalles}
        deshabilitado={guardando}
      />

      {lineas.length === 0 ? (
        <Aviso>Aún no hay productos en la factura.</Aviso>
      ) : (
        lineas.map((linea, indice) => (
          <LineaCarrito
            key={linea.producto.produc_id}
            nombre={linea.producto.produc_nombre}
            serie={linea.producto.produc_serie}
            precio={linea.producto.produc_precio}
            cantidad={linea.cantidad}
            stock={linea.producto.produc_cantidad}
            onMas={() => cambiarCantidad(linea.producto.produc_id, 1)}
            onMenos={() => cambiarCantidad(linea.producto.produc_id, -1)}
            onQuitar={() => quitarLinea(linea.producto.produc_id)}
            error={errores[`detalles.${indice}.cantidad`] ?? errores[`detalles.${indice}.produc_id`]}
          />
        ))
      )}

      <Seccion>Datos de la factura</Seccion>
      <CajaFecha>
        <EtiquetaFecha>Fecha</EtiquetaFecha>
        <ValorFecha>{formatoFechaCorta(hoyISO())} (hoy)</ValorFecha>
      </CajaFecha>

      <CampoSelector
        etiqueta="Tarifa de IVA"
        obligatorio
        valor={ivaId}
        opciones={tarifas.map((t) => ({ valor: t.iva_id, etiqueta: t.iva_nombre }))}
        onCambio={(valor) => {
          setIvaId(valor);
          quitarErrores('iva_id');
        }}
        error={errores.iva_id}
        placeholder="Selecciona la tarifa"
        deshabilitado={guardando}
      />

      <CampoTexto
        etiqueta="Descuento ($)"
        valor={descuento}
        onCambio={(texto) => {
          setDescuento(texto);
          quitarErrores('fac_descuento');
        }}
        error={errorDescuento}
        filtro={(t) => filtrarDecimal(t, 8, 2)}
        keyboardType="decimal-pad"
        maxLength={11}
        placeholder="0.00"
      />

      <SelectorBuscable
        etiqueta="Vendedor"
        obligatorio
        placeholder="Selecciona el vendedor"
        valor={vendedor}
        cargar={cargarVendedores}
        clave={claveVendedor}
        titulo={tituloVendedor}
        detalle={detalleVendedor}
        onElegir={(elegido) => {
          setVendedor(elegido);
          quitarErrores('vend_id');
        }}
        tituloVentana="Seleccionar vendedor"
        placeholderBuscar="Buscar por nombre, código o correo..."
        error={errores.vend_id}
        deshabilitado={guardando}
      />

      <Seccion>Resumen</Seccion>
      <ResumenFactura totales={totales} porcentaje={tarifa ? Number(tarifa.iva_valor) : null} />

      <BotonPrincipal texto="Facturar" cargando={guardando} onPress={facturar} />
      <Espacio />
      <BotonPrincipal
        texto="Cancelar"
        variante="secundario"
        deshabilitado={guardando}
        onPress={() => navigation.goBack()}
      />
    </ContenedorFormulario>
  );
}