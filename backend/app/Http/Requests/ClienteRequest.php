<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\LimpiaEntradas;
use App\Rules\CedulaEcuatoriana;
use App\Rules\SoloLetras;
use App\Rules\TelefonoCelular;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClienteRequest extends FormRequest
{
    use LimpiaEntradas;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->limpiarEspacios([
            'cli_cedula', 'cli_nombres', 'cli_correo', 'cli_telefono', 'cli_direccion',
        ]);
        $this->ponerMinusculas(['cli_correo']);
    }

    public function rules(): array
    {
        $id = $this->route('cliente')?->cli_id;

        // La ciudad debe existir Y pertenecer a la provincia enviada.
        $ciudad = Rule::exists('t_ciudad', 'ciud_id');
        if (is_numeric($this->input('prov_id'))) {
            $ciudad->where('prov_id', (int) $this->input('prov_id'));
        }

        return [
            'cli_cedula' => [
                'bail', 'required', 'string', new CedulaEcuatoriana,
                Rule::unique('t_cliente', 'cli_cedula')->ignore($id, 'cli_id'),
            ],
            'cli_nombres' => [
                'bail', 'required', 'string', 'max:45', new SoloLetras,
            ],
            'cli_correo' => [
                'bail', 'required', 'string', 'max:45', 'email:rfc',
                'regex:/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/',
                Rule::unique('t_cliente', 'cli_correo')->ignore($id, 'cli_id'),
            ],
            'cli_telefono' => [
                'bail', 'required', 'string', new TelefonoCelular,
            ],
            'cli_direccion' => [
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
            'cli_cedula.unique' => 'Ya existe un cliente con esa cédula.',
            'cli_correo.unique' => 'Ya existe un cliente con ese correo.',
            'cli_correo.regex' => 'El correo debe tener un dominio válido (por ejemplo, nombre@dominio.com).',
            'ciud_id.exists' => 'La ciudad seleccionada no existe o no pertenece a la provincia elegida.',
        ];
    }
}