<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Tahap 1
            $table->string('judul_pengajuan');
            $table->string('jenis_pengajuan');
            $table->string('provinsi');
            $table->string('kabupaten_kota');

            // Tahap 2
            $table->string('nama_pemohon');
            $table->string('instansi');
            $table->string('penanggung_jawab');

            // Tahap 3
            $table->string('dokumen_pdf');
            $table->string('dokumen_word')->nullable();
            $table->string('dokumen_zip')->nullable();

            // Status review
            $table->string('status')->default('menunggu_review');
            $table->text('catatan_admin')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
