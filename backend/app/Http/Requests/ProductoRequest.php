<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios([
            'produc_serie', 'produc_nombre', 'produc_cantidad',
            'produc_fecha_venci', 'produc_precio',
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('producto')?->produc_id;

        // "No pasada" solo se exige al crear; al editar un producto ya vencido se permite.
        $reglasFecha = ['bail', 'required', 'date_format:Y-m-d'];
        if ($this->isMethod('POST')) {
            $reglasFecha[] = 'after_or_equal:today';
        }

        return [
            'produc_serie' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_productos', 'produc_serie')->ignore($id, 'produc_id'),
            ],
            'produc_nombre' => [
                'bail', 'required', 'string', 'max:45',
            ],
            'produc_cantidad' => [
                'bail', 'required', 'integer', 'min:0', 'max:99999999',
            ],
            'produc_precio' => [
                'bail', 'required', 'numeric', 'gt:0', 'max:99999999.99', 'decimal:0,2',
            ],
            'produc_fecha_venci' => $reglasFecha,
            'provee_id' => [
                'bail', 'required', 'integer', Rule::exists('t_proveedor', 'provee_id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'produc_serie.unique' => 'Ya existe un producto con esa serie.',
            'produc_cantidad.integer' => 'La cantidad debe ser un número entero.',
            'produc_precio.gt' => 'El precio debe ser mayor que 0.',
            'produc_precio.decimal' => 'El precio admite máximo 2 decimales.',
            'produc_fecha_venci.date_format' => 'La fecha de vencimiento debe tener el formato AAAA-MM-DD.',
            'produc_fecha_venci.after_or_equal' => 'La fecha de vencimiento no puede ser anterior a hoy.',
        ];
    }
}