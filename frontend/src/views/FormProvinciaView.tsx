import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { guardarProvincia } from '../controllers/provinciaController';
import type { RootStackParamList } from '../navigation/tipos';
import { filtrarLetras } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'FormProvincia'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormProvinciaView({ navigation, route }: Props) {
  const provincia = route.params?.provincia;

  const [codigo, setCodigo] = useState(provincia?.prov_codigo ?? '');
  const [nombre, setNombre] = useState(provincia?.prov_nombres ?? '');
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  // Evita enviar dos veces si el usuario toca el botón muy rápido (el estado se actualiza con retraso).
  const enviando = useRef(false);

  const alCambiar = (campo: string, poner: (texto: string) => void) => (texto: string) => {
    poner(texto);
    setErrores((previos) => ({ ...previos, [campo]: null })); // al corregir, se quita el rojo de ese campo
  };

  const guardar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);

    const resultado = await guardarProvincia(provincia?.prov_id ?? null, {
      prov_codigo: codigo,
      prov_nombres: nombre,
    });

    if (resultado.ok) {
      // Se mantiene "guardando" hasta salir de la pantalla, para no permitir un segundo envío.
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

    // Sin conexión, timeout, error 500, etc.: los datos escritos se conservan.
    Alert.alert('No se pudo guardar', resultado.error.mensaje);
  };

  return (
    <ContenedorFormulario>
      <CampoTexto
        etiqueta="Código"
        obligatorio
        valor={codigo}
        onCambio={alCambiar('prov_codigo', setCodigo)}
        error={errores.prov_codigo}
      />
      <CampoTexto
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={alCambiar('prov_nombres', setNombre)}
        error={errores.prov_nombres}
        filtro={filtrarLetras}
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