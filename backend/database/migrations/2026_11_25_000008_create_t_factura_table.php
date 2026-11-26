<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_factura', function (Blueprint $table) {
            $table->increments('fac_id');
            $table->string('fac_numero', 45)->unique();
            $table->date('fac_fecha');
            $table->unsignedInteger('cli_id');
            $table->unsignedInteger('vend_id');
            $table->decimal('fac_subtotal', 10, 2);
            $table->unsignedInteger('iva_id');
            $table->decimal('fac_descuento', 10, 2);
            $table->decimal('fac_total', 10, 2);

            $table->foreign('cli_id')->references('cli_id')->on('t_cliente')->restrictOnDelete();
            $table->foreign('vend_id')->references('vend_id')->on('t_vendedor')->restrictOnDelete();
            $table->foreign('iva_id')->references('iva_id')->on('t_iva')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_factura');
    }
};