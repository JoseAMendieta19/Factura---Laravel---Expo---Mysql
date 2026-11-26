<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IvaRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios(['iva_nombre', 'iva_valor']);
    }

    public function rules(): array
    {
        $id = $this->route('iva')?->iva_id;

        return [
            'iva_nombre' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_iva', 'iva_nombre')->ignore($id, 'iva_id'),
            ],
            'iva_valor' => [
                'bail', 'required', 'numeric', 'between:0,100', 'decimal:0,2',
                Rule::unique('t_iva', 'iva_valor')->ignore($id, 'iva_id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'iva_valor.decimal' => 'El valor del IVA admite máximo 2 decimales.',
            'iva_valor.unique' => 'Ya existe una tarifa de IVA con ese porcentaje.',
        ];
    }
}