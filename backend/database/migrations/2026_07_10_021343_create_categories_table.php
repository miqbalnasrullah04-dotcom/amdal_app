<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');            // e.g. "Narasumber/Pembicara"
            $table->string('slug')->unique();   // e.g. "narasumber"
            $table->string('icon')->nullable(); // heroicon name, e.g. "MicrophoneIcon"
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
