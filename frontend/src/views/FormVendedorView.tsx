import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import SelectorProvinciaCiudad from '../components/SelectorProvinciaCiudad';
import { guardarVendedor } from '../controllers/vendedorController';
import type { RootStackParamList } from '../navigation/tipos';
import { filtrarCorreo, filtrarDigitos, filtrarLetras } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'FormVendedor'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormVendedorView({ navigation, route }: Props) {
  const vendedor = route.params?.vendedor;

  const [codigo, setCodigo] = useState(vendedor?.vend_codigo ?? '');
  const [nombre, setNombre] = useState(vendedor?.vend_nombre ?? '');
  const [correo, setCorreo] = useState(vendedor?.vend_correo ?? '');
  const [telefono, setTelefono] = useState(vendedor?.vend_telefono ?? '');
  const [provId, setProvId] = useState<number | null>(vendedor?.prov_id ?? null);
  const [ciudId, setCiudId] = useState<number | null>(vendedor?.ciud_id ?? null);

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

    const resultado = await guardarVendedor(vendedor?.vend_id ?? null, {
      vend_codigo: codigo,
      vend_nombre: nombre,
      vend_correo: correo,
      vend_telefono: telefono,
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
          quitarErrores('vend_codigo');
        }}
        error={errores.vend_codigo}
      />
      <CampoTexto
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={(texto) => {
          setNombre(texto);
          quitarErrores('vend_nombre');
        }}
        error={errores.vend_nombre}
        filtro={filtrarLetras}
      />
      <CampoTexto
        etiqueta="Correo"
        obligatorio
        valor={correo}
        onCambio={(texto) => {
          setCorreo(texto);
          quitarErrores('vend_correo');
        }}
        error={errores.vend_correo}
        filtro={filtrarCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto
        etiqueta="Teléfono"
        obligatorio
        valor={telefono}
        onCambio={(texto) => {
          setTelefono(texto);
          quitarErrores('vend_telefono');
        }}
        error={errores.vend_telefono}
        filtro={(t) => filtrarDigitos(t, 10)}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="09XXXXXXXX"
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