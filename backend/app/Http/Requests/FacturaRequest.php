<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FacturaRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios(['fac_fecha', 'fac_descuento']);

        // Si no se envía descuento, es 0.
        if ($this->input('fac_descuento') === null) {
            $this->merge(['fac_descuento' => 0]);
        }
    }

    public function rules(): array
    {
        return [
            'cli_id' => ['bail', 'required', 'integer', Rule::exists('t_cliente', 'cli_id')],
            'vend_id' => ['bail', 'required', 'integer', Rule::exists('t_vendedor', 'vend_id')],
            'iva_id' => ['bail', 'required', 'integer', Rule::exists('t_iva', 'iva_id')],
            'fac_fecha' => ['bail', 'required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'fac_descuento' => ['bail', 'nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],

            'detalles' => ['bail', 'required', 'array', 'min:1', 'max:100'],
            'detalles.*' => ['bail', 'array'],
            'detalles.*.produc_id' => [
                'bail', 'required', 'integer', 'distinct',
                Rule::exists('t_productos', 'produc_id'),
            ],
            'detalles.*.cantidad' => ['bail', 'required', 'integer', 'min:1', 'max:99999999'],
        ];
    }

    public function messages(): array
    {
        return [
            'detalles.required' => 'Debe agregar al menos un producto a la factura.',
            'detalles.min' => 'Debe agregar al menos un producto a la factura.',
            'detalles.max' => 'La factura no puede tener más de :max productos.',
            'detalles.*.produc_id.distinct' => 'Ese producto está repetido en la factura.',
            'detalles.*.cantidad.integer' => 'La cantidad debe ser un número entero.',
            'detalles.*.cantidad.min' => 'La cantidad debe ser al menos 1.',
            'fac_fecha.date_format' => 'La fecha debe tener el formato AAAA-MM-DD.',
            'fac_fecha.before_or_equal' => 'La fecha de la factura no puede ser futura.',
            'fac_descuento.min' => 'El descuento no puede ser negativo.',
            'fac_descuento.decimal' => 'El descuento admite máximo 2 decimales.',
        ];
    }
}