<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_proveedor', function (Blueprint $table) {
            $table->increments('provee_id');
            $table->string('provee_codigo', 45)->unique();
            $table->string('provee_nombre', 45)->unique();
            $table->string('provee_telefono', 45);
            $table->unsignedInteger('prov_id');
            $table->unsignedInteger('ciud_id');
            $table->string('provee_direccion', 45);

            $table->foreign('prov_id')->references('prov_id')->on('t_provincia')->restrictOnDelete();
            $table->foreign('ciud_id')->references('ciud_id')->on('t_ciudad')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_proveedor');
    }
};