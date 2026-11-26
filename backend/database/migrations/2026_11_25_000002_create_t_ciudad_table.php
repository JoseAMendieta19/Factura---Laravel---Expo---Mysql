<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_ciudad', function (Blueprint $table) {
            $table->increments('ciud_id');
            $table->string('ciu_codigo', 45)->unique();
            $table->string('ciud_nombre', 45);
            $table->unsignedInteger('prov_id');

            $table->foreign('prov_id')->references('prov_id')->on('t_provincia')->restrictOnDelete();

            // Nombre único dentro de cada provincia (ignora mayúsculas y tildes por el collation).
            $table->unique(['prov_id', 'ciud_nombre'], 'uq_ciudad_prov_nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_ciudad');
    }
};