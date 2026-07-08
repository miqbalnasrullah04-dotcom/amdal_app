<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('keahlian')->nullable();
            $table->string('kategori')->nullable(); // Narasumber/Pembicara, Tenaga Ahli, Instruktur Pengajar, Peneliti Artikel/Jurnal
            $table->string('lokasi')->nullable();
            $table->string('photo')->nullable();
            $table->string('cover')->nullable();
            $table->boolean('verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experts');
    }
};
