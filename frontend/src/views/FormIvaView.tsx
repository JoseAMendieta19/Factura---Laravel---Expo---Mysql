import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { guardarIva } from '../controllers/ivaController';
import type { RootStackParamList } from '../navigation/tipos';
import { filtrarDecimal } from '../utils/validaciones';

type Props = NativeStackScreenProps<RootStackParamList, 'FormIva'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormIvaView({ navigation, route }: Props) {
  const iva = route.params?.iva;

  const [nombre, setNombre] = useState(iva?.iva_nombre ?? '');
  // "15.00" se muestra como "15" y "8.50" como "8.5".
  const [valor, setValor] = useState(iva ? String(Number(iva.iva_valor)) : '');
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  const quitarError = (campo: string) => setErrores((previos) => ({ ...previos, [campo]: null }));

  const guardar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);

    const resultado = await guardarIva(iva?.iva_id ?? null, {
      iva_nombre: nombre,
      iva_valor: valor,
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
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={(texto) => {
          setNombre(texto);
          quitarError('iva_nombre');
        }}
        error={errores.iva_nombre}
        placeholder="Ej. IVA 15%"
      />
      <CampoTexto
        etiqueta="Valor (%)"
        obligatorio
        valor={valor}
        onCambio={(texto) => {
          setValor(texto);
          quitarError('iva_valor');
        }}
        error={errores.iva_valor}
        filtro={(t) => filtrarDecimal(t, 3, 2)}
        keyboardType="decimal-pad"
        maxLength={6}
        placeholder="Ej. 15 o 8.5"
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