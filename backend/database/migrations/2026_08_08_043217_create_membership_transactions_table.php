<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('membership_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('package', ['free', 'premium'])->comment('Paket membership');
            $table->enum('type', ['upgrade', 'renewal'])->comment('Jenis transaksi');
            $table->decimal('price', 10, 2)->comment('Harga normal');
            $table->decimal('discount', 5, 2)->default(0)->comment('Persentase diskon');
            $table->decimal('total_price', 10, 2)->comment('Total harga setelah diskon');
            $table->timestamp('started_at')->comment('Tanggal mulai membership');
            $table->timestamp('expires_at')->comment('Tanggal berakhir membership');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending')->comment('Status pembayaran');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['payment_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_transactions');
    }
};
