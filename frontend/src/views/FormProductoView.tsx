import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoFecha from '../components/CampoFecha';
import CampoSelector from '../components/CampoSelector';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { Cargando, ErrorConReintento, EstadoVacio } from '../components/Estados';
import { guardarProducto } from '../controllers/productoController';
import { cargarProveedores } from '../controllers/proveedorController';
import type { Proveedor } from '../models/Proveedor';
import type { RootStackParamList } from '../navigation/tipos';
import { hoyISO } from '../utils/fechas';
import { filtrarDecimal, filtrarDigitos } from '../utils/validaciones';


type Props = NativeStackScreenProps<RootStackParamList, 'FormProducto'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormProductoView({ navigation, route }: Props) {
  const producto = route.params?.producto;

  const [serie, setSerie] = useState(producto?.produc_serie ?? '');
  const [nombre, setNombre] = useState(producto?.produc_nombre ?? '');
  const [cantidad, setCantidad] = useState(producto ? String(producto.produc_cantidad) : '');
  const [precio, setPrecio] = useState(producto?.produc_precio ?? '');
  const [fecha, setFecha] = useState(producto?.produc_fecha_venci ?? '');
  const [proveeId, setProveeId] = useState<number | null>(producto?.provee_id ?? null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargandoProv, setCargandoProv] = useState(true);
  const [errorProv, setErrorProv] = useState<string | null>(null);

  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  const cargarOpciones = useCallback(async () => {
    setCargandoProv(true);
    setErrorProv(null);

    const resultado = await cargarProveedores('');
    if (resultado.ok) setProveedores(resultado.datos);
    else setErrorProv(resultado.error.mensaje);

    setCargandoProv(false);
  }, []);

  useEffect(() => {
    cargarOpciones();
  }, [cargarOpciones]);

  const quitarError = (campo: string) => setErrores((previos) => ({ ...previos, [campo]: null }));

  const guardar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);

    const resultado = await guardarProducto(producto?.produc_id ?? null, {
      produc_serie: serie,
      produc_nombre: nombre,
      produc_cantidad: cantidad,
      produc_precio: precio,
      produc_fecha_venci: fecha,
      provee_id: proveeId,
    });

    if (resultado.ok) {
      Alert.alert('Listo', resultado.mensaje, [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
      return;
    }

    enviando.current = false;
    setGuardando(false);

    if (resultado.error.tipo === 'validacion') {
      setErrores(resultado.error.errores);
      return;
    }

    if (resultado.error.tipo === 'no_encontrado') {
      Alert.alert('No se pudo guardar', resultado.error.mensaje, [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    Alert.alert('No se pudo guardar', resultado.error.mensaje);
  };

  if (cargandoProv) return <Cargando texto="Cargando proveedores..." />;
  if (errorProv) return <ErrorConReintento mensaje={errorProv} onReintentar={cargarOpciones} />;
  if (proveedores.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay proveedores registrados"
        detalle="Cada producto necesita un proveedor. Registra uno desde el módulo Proveedores."
      />
    );
  }

  return (
    <ContenedorFormulario>
      <CampoTexto
        etiqueta="Serie"
        obligatorio
        valor={serie}
        onCambio={(texto) => {
          setSerie(texto);
          quitarError('produc_serie');
        }}
        error={errores.produc_serie}
        autoCapitalize="characters"
      />
      <CampoTexto
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={(texto) => {
          setNombre(texto);
          quitarError('produc_nombre');
        }}
        error={errores.produc_nombre}
      />
      <CampoTexto
        etiqueta="Cantidad (stock)"
        obligatorio
        valor={cantidad}
        onCambio={(texto) => {
          setCantidad(texto);
          quitarError('produc_cantidad');
        }}
        error={errores.produc_cantidad}
        filtro={(t) => filtrarDigitos(t, 8)}
        keyboardType="number-pad"
        maxLength={8}
        placeholder="Ej. 50"
      />
      <CampoTexto
        etiqueta="Precio ($)"
        obligatorio
        valor={precio}
        onCambio={(texto) => {
          setPrecio(texto);
          quitarError('produc_precio');
        }}
        error={errores.produc_precio}
        filtro={(t) => filtrarDecimal(t, 8, 2)}
        keyboardType="decimal-pad"
        maxLength={11}
        placeholder="Ej. 2.50"
      />
            {/* Al crear no puede ser pasada; al editar sí (un producto ya vencido debe poder corregirse). */}
      <CampoFecha
        etiqueta="Fecha de vencimiento"
        obligatorio
        valor={fecha}
        onCambio={(iso) => {
          setFecha(iso);
          quitarError('produc_fecha_venci');
        }}
        error={errores.produc_fecha_venci}
        minimo={producto ? undefined : hoyISO()}
        deshabilitado={guardando}
      />
      <CampoSelector
        etiqueta="Proveedor"
        obligatorio
        valor={proveeId}
        opciones={proveedores.map((p) => ({ valor: p.provee_id, etiqueta: p.provee_nombre }))}
        onCambio={(valor) => {
          setProveeId(valor);
          quitarError('provee_id');
        }}
        error={errores.provee_id}
        placeholder="Selecciona el proveedor"
        deshabilitado={guardando}
      />

      <Espacio />
      <BotonPrincipal texto="Guardar" cargando={guardando} onPress={guardar} />
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