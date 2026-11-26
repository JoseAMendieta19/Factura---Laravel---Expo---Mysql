<?php

namespace Database\Seeders;

use App\Models\Iva;
use Illuminate\Database\Seeder;

class IvaSeeder extends Seeder
{
    public function run(): void
    {
        $tarifas = [
            ['nombre' => 'IVA 0%',  'valor' => 0],
            ['nombre' => 'IVA 15%', 'valor' => 15],
        ];

        foreach ($tarifas as $tarifa) {
            Iva::updateOrCreate(
                ['iva_valor' => $tarifa['valor']],
                ['iva_nombre' => $tarifa['nombre']]
            );
        }
    }
}