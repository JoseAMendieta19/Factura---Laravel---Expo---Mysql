import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import SelectorProvinciaCiudad from '../components/SelectorProvinciaCiudad';
import { guardarProveedor } from '../controllers/proveedorController';
import type { RootStackParamList } from '../navigation/tipos';
import { filtrarDigitos } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'FormProveedor'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormProveedorView({ navigation, route }: Props) {
  const proveedor = route.params?.proveedor;

  const [codigo, setCodigo] = useState(proveedor?.provee_codigo ?? '');
  const [nombre, setNombre] = useState(proveedor?.provee_nombre ?? '');
  const [telefono, setTelefono] = useState(proveedor?.provee_telefono ?? '');
  const [direccion, setDireccion] = useState(proveedor?.provee_direccion ?? '');
  const [provId, setProvId] = useState<number | null>(proveedor?.prov_id ?? null);
  const [ciudId, setCiudId] = useState<number | null>(proveedor?.ciud_id ?? null);

  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  const quitarErrores = (...campos: string[]) =>
    setErrores((previos) => {
      const nuevos = { ...previos };
      campos.forEach((campo) => {
        nuevos[campo] = null;
      });
      return nuevos;
    });

  const guardar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);

    const resultado = await guardarProveedor(proveedor?.provee_id ?? null, {
      provee_codigo: codigo,
      provee_nombre: nombre,
      provee_telefono: telefono,
      provee_direccion: direccion,
      prov_id: provId,
      ciud_id: ciudId,
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

  return (
    <ContenedorFormulario>
      <CampoTexto
        etiqueta="Código"
        obligatorio
        valor={codigo}
        onCambio={(texto) => {
          setCodigo(texto);
          quitarErrores('provee_codigo');
        }}
        error={errores.provee_codigo}
      />
      <CampoTexto
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={(texto) => {
          setNombre(texto);
          quitarErrores('provee_nombre');
        }}
        error={errores.provee_nombre}
      />
      <CampoTexto
        etiqueta="Teléfono"
        obligatorio
        valor={telefono}
        onCambio={(texto) => {
          setTelefono(texto);
          quitarErrores('provee_telefono');
        }}
        error={errores.provee_telefono}
        filtro={(t) => filtrarDigitos(t, 10)}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="09XXXXXXXX"
      />
      <CampoTexto
        etiqueta="Dirección"
        obligatorio
        valor={direccion}
        onCambio={(texto) => {
          setDireccion(texto);
          quitarErrores('provee_direccion');
        }}
        error={errores.provee_direccion}
      />

      <SelectorProvinciaCiudad
        provId={provId}
        ciudId={ciudId}
        onCambio={(nuevaProv, nuevaCiudad) => {
          setProvId(nuevaProv);
          setCiudId(nuevaCiudad);
          quitarErrores('prov_id', 'ciud_id');
        }}
        errorProvincia={errores.prov_id}
        errorCiudad={errores.ciud_id}
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