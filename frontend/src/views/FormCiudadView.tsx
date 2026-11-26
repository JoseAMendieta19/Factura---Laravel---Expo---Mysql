import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoSelector from '../components/CampoSelector';
import CampoTexto from '../components/CampoTexto';
import ContenedorFormulario from '../components/ContenedorFormulario';
import { Cargando, ErrorConReintento } from '../components/Estados';
import { guardarCiudad } from '../controllers/ciudadController';
import { cargarProvincias } from '../controllers/provinciaController';
import type { Provincia } from '../models/Provincia';
import type { RootStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<RootStackParamList, 'FormCiudad'>;
type Errores = Record<string, string | null | undefined>;

const Espacio = styled.View`
  height: 12px;
`;

export default function FormCiudadView({ navigation, route }: Props) {
  const ciudad = route.params?.ciudad;

  const [codigo, setCodigo] = useState(ciudad?.ciu_codigo ?? '');
  const [nombre, setNombre] = useState(ciudad?.ciud_nombre ?? '');
  const [provId, setProvId] = useState<number | null>(ciudad?.prov_id ?? null);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cargandoProv, setCargandoProv] = useState(true);
  const [errorProv, setErrorProv] = useState<string | null>(null);

  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  const cargarOpciones = useCallback(async () => {
    setCargandoProv(true);
    setErrorProv(null);

    const resultado = await cargarProvincias('');
    if (resultado.ok) setProvincias(resultado.datos);
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

    const resultado = await guardarCiudad(ciudad?.ciud_id ?? null, {
      ciu_codigo: codigo,
      ciud_nombre: nombre,
      prov_id: provId,
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

  if (cargandoProv) return <Cargando texto="Cargando provincias..." />;
  if (errorProv) return <ErrorConReintento mensaje={errorProv} onReintentar={cargarOpciones} />;

  return (
    <ContenedorFormulario>
      <CampoTexto
        etiqueta="Código"
        obligatorio
        valor={codigo}
        onCambio={(texto) => {
          setCodigo(texto);
          quitarError('ciu_codigo');
        }}
        error={errores.ciu_codigo}
      />
      <CampoTexto
        etiqueta="Nombre"
        obligatorio
        valor={nombre}
        onCambio={(texto) => {
          setNombre(texto);
          quitarError('ciud_nombre');
        }}
        error={errores.ciud_nombre}
      />
      <CampoSelector
        etiqueta="Provincia"
        obligatorio
        valor={provId}
        opciones={provincias.map((p) => ({ valor: p.prov_id, etiqueta: p.prov_nombres }))}
        onCambio={(valor) => {
          setProvId(valor);
          quitarError('prov_id');
        }}
        error={errores.prov_id}
        placeholder="Selecciona la provincia"
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