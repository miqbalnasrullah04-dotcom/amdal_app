<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('package_name')->default('Tenaga Ahli KLHS');
            $table->unsignedBigInteger('amount')->default(200000);
            $table->string('reference_code')->unique();
            $table->string('proof_of_payment')->nullable();
            $table->enum('status', ['menunggu_pembayaran', 'menunggu_verifikasi', 'verified', 'rejected'])
                ->default('menunggu_pembayaran');
            $table->text('reject_reason')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
