<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('tempat_lahir')->nullable()->after('phone');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('pendidikan')->nullable()->after('tanggal_lahir');
            $table->text('pengalaman')->nullable()->after('pendidikan');
            $table->string('cv_path')->nullable()->after('pengalaman');
            $table->string('bukti_kompetensi_path')->nullable()->after('cv_path');
        });
    }

    public function down(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'tempat_lahir',
                'tanggal_lahir',
                'pendidikan',
                'pengalaman',
                'cv_path',
                'bukti_kompetensi_path'
            ]);
        });
    }
};
