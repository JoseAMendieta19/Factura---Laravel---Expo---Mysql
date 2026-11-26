<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_detalle_factura', function (Blueprint $table) {
            $table->increments('det_fac_id');
            $table->unsignedInteger('fac_id');
            $table->unsignedInteger('produc_id');
            $table->decimal('det_fac_cant', 10, 2);
            $table->decimal('det_fac_precio_unitario', 10, 2);
            $table->decimal('det_fac_total', 10, 2);

            $table->foreign('fac_id')->references('fac_id')->on('t_factura')->restrictOnDelete();
            $table->foreign('produc_id')->references('produc_id')->on('t_productos')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_detalle_factura');
    }
};