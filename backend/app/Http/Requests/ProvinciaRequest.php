<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use App\Rules\SoloLetras;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProvinciaRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios(['prov_codigo', 'prov_nombres']);
    }

    public function rules(): array
    {
        // Al editar, la ruta trae la provincia; al crear es null (no se excluye a nadie).
        $id = $this->route('provincia')?->prov_id;

        return [
            'prov_codigo' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_provincia', 'prov_codigo')->ignore($id, 'prov_id'),
            ],
            'prov_nombres' => [
                'bail', 'required', 'string', 'max:45', new SoloLetras,
                Rule::unique('t_provincia', 'prov_nombres')->ignore($id, 'prov_id'),
            ],
        ];
    }
}