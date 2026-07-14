<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Biasa", "Premium"
            $table->string('slug')->unique();
            $table->unsignedBigInteger('price')->default(0); // 0 = gratis, langsung aktif
            $table->text('description')->nullable();
            $table->json('benefits')->nullable(); // list keuntungan, ditampilkan di halaman pilih paket
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
