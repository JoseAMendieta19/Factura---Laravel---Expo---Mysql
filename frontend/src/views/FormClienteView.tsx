import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import SelectorProvinciaCiudad from '../components/SelectorProvinciaCiudad';
import { guardarCliente } from '../controllers/clienteController';
import type { RootStackParamList } from '../navigation/tipos';
import { filtrarCorreo, filtrarDigitos, filtrarLetras } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'FormCliente'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormClienteView({ navigation, route }: Props) {
  const cliente = route.params?.cliente;

  const [cedula, setCedula] = useState(cliente?.cli_cedula ?? '');
  const [nombres, setNombres] = useState(cliente?.cli_nombres ?? '');
  const [correo, setCorreo] = useState(cliente?.cli_correo ?? '');
  const [telefono, setTelefono] = useState(cliente?.cli_telefono ?? '');
  const [direccion, setDireccion] = useState(cliente?.cli_direccion ?? '');
  const [provId, setProvId] = useState<number | null>(cliente?.prov_id ?? null);
  const [ciudId, setCiudId] = useState<number | null>(cliente?.ciud_id ?? null);

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

    const resultado = await guardarCliente(cliente?.cli_id ?? null, {
      cli_cedula: cedula,
      cli_nombres: nombres,
      cli_correo: correo,
      cli_telefono: telefono,
      cli_direccion: direccion,
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
        etiqueta="Cédula"
        obligatorio
        valor={cedula}
        onCambio={(texto) => {
          setCedula(texto);
          quitarErrores('cli_cedula');
        }}
        error={errores.cli_cedula}
        filtro={(t) => filtrarDigitos(t, 10)}
        keyboardType="number-pad"
        maxLength={10}
      />
      <CampoTexto
        etiqueta="Nombres"
        obligatorio
        valor={nombres}
        onCambio={(texto) => {
          setNombres(texto);
          quitarErrores('cli_nombres');
        }}
        error={errores.cli_nombres}
        filtro={filtrarLetras}
      />
      <CampoTexto
        etiqueta="Correo"
        obligatorio
        valor={correo}
        onCambio={(texto) => {
          setCorreo(texto);
          quitarErrores('cli_correo');
        }}
        error={errores.cli_correo}
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
          quitarErrores('cli_telefono');
        }}
        error={errores.cli_telefono}
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
          quitarErrores('cli_direccion');
        }}
        error={errores.cli_direccion}
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