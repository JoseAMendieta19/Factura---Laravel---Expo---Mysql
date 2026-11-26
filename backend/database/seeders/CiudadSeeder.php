<?php

namespace Database\Seeders;

use App\Models\Ciudad;
use App\Models\Provincia;
use Illuminate\Database\Seeder;

class CiudadSeeder extends Seeder
{
    public function run(): void
    {
        // código de provincia => [código de ciudad => nombre]
        $ciudades = [
            '01' => ['0101' => 'Cuenca'],
            '02' => ['0201' => 'Guaranda'],
            '03' => ['0301' => 'Azogues'],
            '04' => ['0401' => 'Tulcán'],
            '05' => ['0501' => 'Latacunga'],
            '06' => ['0601' => 'Riobamba'],
            '07' => ['0701' => 'Machala'],
            '08' => ['0801' => 'Esmeraldas'],
            '09' => ['0901' => 'Guayaquil', '0902' => 'Durán', '0903' => 'Milagro'],
            '10' => ['1001' => 'Ibarra'],
            '11' => ['1101' => 'Loja'],
            '12' => ['1201' => 'Babahoyo', '1202' => 'Quevedo'],
            '13' => [
                '1301' => 'Portoviejo',
                '1302' => 'Manta',
                '1303' => 'Chone',
                '1304' => 'El Carmen',
                '1305' => 'Jipijapa',
                '1306' => 'Montecristi',
                '1307' => 'Pedernales',
            ],
            '14' => ['1401' => 'Macas'],
            '15' => ['1501' => 'Tena'],
            '16' => ['1601' => 'Puyo'],
            '17' => ['1701' => 'Quito'],
            '18' => ['1801' => 'Ambato'],
            '19' => ['1901' => 'Zamora'],
            '20' => ['2001' => 'Puerto Baquerizo Moreno'],
            '21' => ['2101' => 'Nueva Loja'],
            '22' => ['2201' => 'Francisco de Orellana'],
            '23' => ['2301' => 'Santo Domingo'],
            '24' => ['2401' => 'Santa Elena'],
        ];

        foreach ($ciudades as $codigoProvincia => $lista) {
            $provincia = Provincia::where('prov_codigo', $codigoProvincia)->firstOrFail();

            foreach ($lista as $codigo => $nombre) {
                Ciudad::updateOrCreate(
                    ['ciu_codigo' => $codigo],
                    ['ciud_nombre' => $nombre, 'prov_id' => $provincia->prov_id]
                );
            }
        }
    }
}