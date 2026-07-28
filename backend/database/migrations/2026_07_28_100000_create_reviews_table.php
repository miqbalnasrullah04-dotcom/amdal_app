<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_id')->constrained('experts')->cascadeOnDelete();
            // Reviewer bisa user terdaftar atau tamu anonim
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reviewer_name', 100);
            $table->string('reviewer_email', 191)->nullable();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('komentar');
            // Balasan dari tenaga ahli
            $table->text('balasan')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();

            $table->index('expert_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
