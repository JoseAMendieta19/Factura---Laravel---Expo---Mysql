<?php

namespace App\Http\Requests\Concerns;

trait LimpiaEntradas
{
    /**
     * Quita espacios al inicio y al final, colapsa espacios repetidos
     * y convierte "solo espacios" en null (para que falle "required").
     */
    protected function limpiarEspacios(array $campos): void
    {
        $datos = [];

        foreach ($campos as $campo) {
            $valor = $this->input($campo);

            if (is_string($valor)) {
                $limpio = trim(preg_replace('/\s+/u', ' ', $valor) ?? $valor);
                $datos[$campo] = $limpio === '' ? null : $limpio;
            }
        }

        $this->merge($datos);
    }

    /** Convierte a minúsculas (por ejemplo, correos). Llamar después de limpiarEspacios(). */
    protected function ponerMinusculas(array $campos): void
    {
        $datos = [];

        foreach ($campos as $campo) {
            $valor = $this->input($campo);

            if (is_string($valor)) {
                $datos[$campo] = mb_strtolower($valor);
            }
        }

        $this->merge($datos);
    }
}