<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_vendedor', function (Blueprint $table) {
            $table->increments('vend_id');
            $table->string('vend_codigo', 45)->unique();
            $table->string('vend_nombre', 45);
            $table->string('vend_correo', 45)->unique();
            $table->string('vend_telefono', 45);
            $table->unsignedInteger('prov_id');
            $table->unsignedInteger('ciud_id');

            $table->foreign('prov_id')->references('prov_id')->on('t_provincia')->restrictOnDelete();
            $table->foreign('ciud_id')->references('ciud_id')->on('t_ciudad')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_vendedor');
    }
};