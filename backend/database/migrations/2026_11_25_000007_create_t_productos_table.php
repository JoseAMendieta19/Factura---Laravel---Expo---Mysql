<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_productos', function (Blueprint $table) {
            $table->increments('produc_id');
            $table->string('produc_serie', 45)->unique();
            $table->string('produc_nombre', 45);
            $table->decimal('produc_cantidad', 10, 2);
            $table->unsignedInteger('provee_id');
            $table->date('produc_fecha_venci');
            $table->decimal('produc_precio', 10, 2);

            $table->foreign('provee_id')->references('provee_id')->on('t_proveedor')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_productos');
    }
};