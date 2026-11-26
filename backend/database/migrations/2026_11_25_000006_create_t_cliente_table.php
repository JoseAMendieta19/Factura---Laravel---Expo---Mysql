<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_cliente', function (Blueprint $table) {
            $table->increments('cli_id');
            $table->string('cli_cedula', 45)->unique();
            $table->string('cli_nombres', 45);
            $table->string('cli_correo', 45)->unique();
            $table->string('cli_telefono', 45);
            $table->string('cli_direccion', 45);
            $table->unsignedInteger('ciud_id');
            $table->unsignedInteger('prov_id');

            $table->foreign('ciud_id')->references('ciud_id')->on('t_ciudad')->restrictOnDelete();
            $table->foreign('prov_id')->references('prov_id')->on('t_provincia')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_cliente');
    }
};