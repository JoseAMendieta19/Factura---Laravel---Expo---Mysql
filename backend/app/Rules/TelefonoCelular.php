<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TelefonoCelular implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $telefono = (string) $value;

        if (!preg_match('/^\d+$/', $telefono)) {
            $fail('El campo :attribute solo puede contener números.');
            return;
        }

        $longitud = strlen($telefono);

        if ($longitud < 10) {
            $faltan = 10 - $longitud;
            $fail("El campo :attribute debe tener 10 dígitos (faltan {$faltan}).");
            return;
        }

        if ($longitud > 10) {
            $sobran = $longitud - 10;
            $fail("El campo :attribute debe tener exactamente 10 dígitos (sobran {$sobran}).");
            return;
        }

        if (!str_starts_with($telefono, '09')) {
            $fail('El campo :attribute debe empezar con 09 (celular).');
        }
    }
}