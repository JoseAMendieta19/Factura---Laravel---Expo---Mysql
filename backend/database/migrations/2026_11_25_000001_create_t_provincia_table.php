<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_provincia', function (Blueprint $table) {
            $table->increments('prov_id');
            $table->string('prov_codigo', 45)->unique();
            $table->string('prov_nombres', 45)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_provincia');
    }
};