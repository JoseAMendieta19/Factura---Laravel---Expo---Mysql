<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CedulaEcuatoriana implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cedula = (string) $value;

        if (!preg_match('/^\d{10}$/', $cedula)) {
            $fail('La cédula debe tener exactamente 10 dígitos numéricos.');
            return;
        }

        // Los dos primeros dígitos son la provincia (01 a 24; 30 = ecuatorianos en el exterior).
        $provincia = (int) substr($cedula, 0, 2);
        if (!(($provincia >= 1 && $provincia <= 24) || $provincia === 30)) {
            $fail('La cédula no es válida: el código de provincia no existe.');
            return;
        }

        // El tercer dígito de una persona natural es menor que 6.
        if ((int) $cedula[2] > 5) {
            $fail('La cédula no es válida: el tercer dígito debe ser menor que 6.');
            return;
        }

        // Módulo 10: coeficientes 2,1,2,1,2,1,2,1,2 sobre los primeros 9 dígitos.
        $suma = 0;
        for ($i = 0; $i < 9; $i++) {
            $coeficiente = $i % 2 === 0 ? 2 : 1;
            $producto = (int) $cedula[$i] * $coeficiente;
            if ($producto > 9) {
                $producto -= 9;
            }
            $suma += $producto;
        }

        $verificador = (10 - ($suma % 10)) % 10;

        if ($verificador !== (int) $cedula[9]) {
            $fail('La cédula no es válida: el dígito verificador no coincide.');
        }
    }
}