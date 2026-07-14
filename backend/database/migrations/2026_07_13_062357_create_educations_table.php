<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained()->cascadeOnDelete();
            $table->string('jenjang'); // S1, S2, S3, D3, dst
            $table->string('institusi');
            $table->string('jurusan')->nullable();
            $table->year('tahun_lulus')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educations');
    }
};
