import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { cargarCiudadesDeProvincia } from '../controllers/ciudadController';
import { cargarProvincias } from '../controllers/provinciaController';
import type { Ciudad } from '../models/Ciudad';
import type { Provincia } from '../models/Provincia';
import { colores } from '../styles/comunes';
import BotonPrincipal from './BotonPrincipal';
import CampoSelector from './CampoSelector';

interface Props {
  provId: number | null;
  ciudId: number | null;
  /** Se llama con la provincia y la ciudad resultantes. Al cambiar de provincia, la ciudad llega en null. */
  onCambio: (provId: number | null, ciudId: number | null) => void;
  errorProvincia?: string | null;
  errorCiudad?: string | null;
  deshabilitado?: boolean;
}

const FilaCarga = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 14px;
`;

const TextoAviso = styled.Text`
  font-size: 14px;
  color: ${colores.textoSecundario};
  margin-left: 10px;
`;

const BloqueError = styled.View`
  margin-bottom: 14px;
`;

const TextoError = styled.Text`
  font-size: 13px;
  color: ${colores.error};
  margin-bottom: 8px;
`;

const Nota = styled.Text`
  font-size: 13px;
  color: ${colores.textoSecundario};
  margin: -6px 0 14px 0;
`;

export default function SelectorProvinciaCiudad({
  provId,
  ciudId,
  onCambio,
  errorProvincia,
  errorCiudad,
  deshabilitado = false,
}: Props) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cargandoProv, setCargandoProv] = useState(true);
  const [errorCargaProv, setErrorCargaProv] = useState<string | null>(null);

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [cargandoCiu, setCargandoCiu] = useState(false);
  const [errorCargaCiu, setErrorCargaCiu] = useState<string | null>(null);

  const peticionCiudades = useRef(0);

  const cargarListaProvincias = useCallback(async () => {
    setCargandoProv(true);
    setErrorCargaProv(null);

    const resultado = await cargarProvincias('');
    if (resultado.ok) setProvincias(resultado.datos);
    else setErrorCargaProv(resultado.error.mensaje);

    setCargandoProv(false);
  }, []);

  const cargarListaCiudades = useCallback(async (idProvincia: number | null) => {
    const numero = ++peticionCiudades.current;
    setErrorCargaCiu(null);
    setCiudades([]);

    if (idProvincia === null) {
      setCargandoCiu(false);
      return;
    }

    setCargandoCiu(true);
    const resultado = await cargarCiudadesDeProvincia(idProvincia);

    // Si mientras tanto se eligió otra provincia, esta respuesta se descarta.
    if (numero !== peticionCiudades.current) return;

    if (resultado.ok) setCiudades(resultado.datos);
    else setErrorCargaCiu(resultado.error.mensaje);

    setCargandoCiu(false);
  }, []);

  useEffect(() => {
    cargarListaProvincias();
  }, [cargarListaProvincias]);

  // Las ciudades se recargan al montar (si se está editando) y cada vez que cambia la provincia.
  useEffect(() => {
    cargarListaCiudades(provId);
  }, [provId, cargarListaCiudades]);

  // La ciudad solo se muestra como elegida si de verdad está en la lista cargada.
  const ciudadMostrada = ciudades.some((c) => c.ciud_id === ciudId) ? ciudId : null;

  const alElegirProvincia = (nueva: number | null) => {
    if (nueva === provId) return;
    onCambio(nueva, null); // al cambiar de provincia se limpia la ciudad
  };

  const alElegirCiudad = (nueva: number | null) => {
    // Se ignoran los cambios mientras carga y los que no cambian nada.
    if (cargandoCiu || nueva === ciudadMostrada) return;
    onCambio(provId, nueva);
  };

  if (cargandoProv) {
    return (
      <FilaCarga>
        <ActivityIndicator color={colores.primario} />
        <TextoAviso>Cargando provincias...</TextoAviso>
      </FilaCarga>
    );
  }

  if (errorCargaProv) {
    return (
      <BloqueError>
        <TextoError>{errorCargaProv}</TextoError>
        <BotonPrincipal texto="Reintentar" variante="secundario" onPress={cargarListaProvincias} />
      </BloqueError>
    );
  }

  let placeholderCiudad = 'Selecciona la ciudad';
  if (provId === null) placeholderCiudad = 'Primero elige la provincia';
  else if (cargandoCiu) placeholderCiudad = 'Cargando ciudades...';
  else if (!errorCargaCiu && ciudades.length === 0) placeholderCiudad = 'Esta provincia no tiene ciudades';

  const sinCiudades = provId !== null && !cargandoCiu && !errorCargaCiu && ciudades.length === 0;

  return (
    <>
      <CampoSelector
        etiqueta="Provincia"
        obligatorio
        valor={provId}
        opciones={provincias.map((p) => ({ valor: p.prov_id, etiqueta: p.prov_nombres }))}
        onCambio={alElegirProvincia}
        error={errorProvincia}
        placeholder="Selecciona la provincia"
        deshabilitado={deshabilitado}
      />

      <CampoSelector
        etiqueta="Ciudad"
        obligatorio
        valor={ciudadMostrada}
        opciones={ciudades.map((c) => ({ valor: c.ciud_id, etiqueta: c.ciud_nombre }))}
        onCambio={alElegirCiudad}
        error={errorCiudad}
        placeholder={placeholderCiudad}
        deshabilitado={deshabilitado || provId === null || cargandoCiu || ciudades.length === 0}
      />

      {!!errorCargaCiu && (
        <BloqueError>
          <TextoError>{errorCargaCiu}</TextoError>
          <BotonPrincipal
            texto="Reintentar"
            variante="secundario"
            onPress={() => cargarListaCiudades(provId)}
          />
        </BloqueError>
      )}

      {sinCiudades && <Nota>Agrega ciudades a esta provincia desde el módulo Ciudades.</Nota>}
    </>
  );
}