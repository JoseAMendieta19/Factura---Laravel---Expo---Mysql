<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_iva', function (Blueprint $table) {
            $table->increments('iva_id');
            $table->string('iva_nombre', 45)->unique();
            $table->decimal('iva_valor', 10, 2)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_iva');
    }
};