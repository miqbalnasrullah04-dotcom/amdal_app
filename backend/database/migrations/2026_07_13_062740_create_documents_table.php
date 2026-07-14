<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['foto_profil', 'ktp', 'ijazah', 'lainnya'])->default('lainnya');
            $table->string('label')->nullable(); // nama file yang user kasih, misal "KTP" atau "Ijazah S2"
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
