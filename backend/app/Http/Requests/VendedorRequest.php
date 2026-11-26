<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use App\Rules\SoloLetras;
use App\Rules\TelefonoCelular;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VendedorRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios([
            'vend_codigo', 'vend_nombre', 'vend_correo', 'vend_telefono',
        ]);
        $this->ponerMinusculas(['vend_correo']);
    }

    public function rules(): array
    {
        $id = $this->route('vendedor')?->vend_id;

        // La ciudad debe existir Y pertenecer a la provincia enviada.
        $ciudad = Rule::exists('t_ciudad', 'ciud_id');
        if (is_numeric($this->input('prov_id'))) {
            $ciudad->where('prov_id', (int) $this->input('prov_id'));
        }

        return [
            'vend_codigo' => [
                'bail', 'required', 'string', 'max:45',
                Rule::unique('t_vendedor', 'vend_codigo')->ignore($id, 'vend_id'),
            ],
            'vend_nombre' => [
                'bail', 'required', 'string', 'max:45', new SoloLetras,
            ],
            'vend_correo' => [
                'bail', 'required', 'string', 'max:45', 'email:rfc',
                'regex:/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/',
                Rule::unique('t_vendedor', 'vend_correo')->ignore($id, 'vend_id'),
            ],
            'vend_telefono' => [
                'bail', 'required', 'string', new TelefonoCelular,
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
            'vend_codigo.unique' => 'Ya existe un vendedor con ese código.',
            'vend_correo.unique' => 'Ya existe un vendedor con ese correo.',
            'vend_correo.regex' => 'El correo debe tener un dominio válido (por ejemplo, nombre@dominio.com).',
            'ciud_id.exists' => 'La ciudad seleccionada no existe o no pertenece a la provincia elegida.',
        ];
    }
}