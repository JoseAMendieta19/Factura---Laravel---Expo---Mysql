<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // El orden importa: las ciudades necesitan que existan las provincias.
        $this->call([
            ProvinciaSeeder::class,
            CiudadSeeder::class,
            IvaSeeder::class,
        ]);
    }
}