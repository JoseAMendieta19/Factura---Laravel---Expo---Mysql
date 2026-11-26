<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use App\Rules\TelefonoCelular;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProveedorRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios([
            'provee_codigo', 'provee_nombre', 'provee_telefono', 'provee_direccion',
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('proveedor')?->provee_id;

        // La ciudad debe existir Y pertenecer a la provincia enviada.
        $ciudad = Rule::exists('t_ciudad', 'ciud_id');
        if (is_numeric($this->input('prov_id'))) {
            $ciudad->where('prov_id', (int) $this->input('prov_id'));
        }

        return [
            'provee_codigo' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_proveedor', 'provee_codigo')->ignore($id, 'provee_id'),
            ],
            'provee_nombre' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_proveedor', 'provee_nombre')->ignore($id, 'provee_id'),
            ],
            'provee_telefono' => [
                'bail', 'required', 'string', new TelefonoCelular,
            ],
            'provee_direccion' => [
                'bail', 'required', 'string', 'max:45',
            ],
            'prov_id' => [
                'bail', 'required', 'integer', Rule::exists('t_provincia', 'prov_id'),
            ],
            'ciud_id' => [
                'bail', 'required', 'integer', $ciudad,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'provee_codigo.unique' => 'Ya existe un proveedor con ese código.',
            'provee_nombre.unique' => 'Ya existe un proveedor con ese nombre.',
            'ciud_id.exists' => 'La ciudad seleccionada no existe o no pertenece a la provincia elegida.',
        ];
    }
}