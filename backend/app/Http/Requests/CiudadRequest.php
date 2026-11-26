<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CiudadRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios(['ciu_codigo', 'ciud_nombre']);
    }

    public function rules(): array
    {
        $id = $this->route('ciudad')?->ciud_id;

        return [
            'ciu_codigo' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_ciudad', 'ciu_codigo')->ignore($id, 'ciud_id'),
            ],
            'ciud_nombre' => [
                'bail', 'required', 'string', 'max:45',
                // Único solo dentro de la provincia elegida.
                Rule::unique('t_ciudad', 'ciud_nombre')
                    ->where('prov_id', $this->input('prov_id'))
                    ->ignore($id, 'ciud_id'),
            ],
            'prov_id' => [
                'bail', 'required', 'integer',
                Rule::exists('t_provincia', 'prov_id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'ciud_nombre.unique' => 'Ya existe una ciudad con ese nombre en la provincia seleccionada.',
        ];
    }
}