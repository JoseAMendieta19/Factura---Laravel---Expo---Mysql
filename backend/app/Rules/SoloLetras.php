<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SoloLetras implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // \p{L} = cualquier letra Unicode (incluye tildes, ñ, ü). Solo se permiten espacios entre palabras.
        if (!is_string($value) || !preg_match('/^\p{L}+(?: +\p{L}+)*$/u', $value)) {
            $fail('El campo :attribute solo puede contener letras y espacios.');
        }
    }
}