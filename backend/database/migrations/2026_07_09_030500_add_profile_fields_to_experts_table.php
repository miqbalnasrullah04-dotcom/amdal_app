<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->string('institution')->nullable()->after('name');
            $table->unsignedSmallInteger('active_since')->nullable()->after('institution');
            $table->string('email')->nullable()->after('active_since');

            // Ganti kriteria dari string tunggal jadi JSON array,
            // supaya 1 expert bisa punya lebih dari 1 kriteria.
            $table->json('kriteria_list')->nullable()->after('kriteria');

            $table->json('keahlian')->nullable()->after('kriteria_list');

            $table->string('alamat_lengkap')->nullable()->after('keahlian');
            $table->string('alamat_kota')->nullable()->after('alamat_lengkap');
            $table->string('alamat_provinsi')->nullable()->after('alamat_kota');

            $table->string('lokasi_label')->nullable()->after('alamat_provinsi');

            $table->json('sosial')->nullable()->after('lokasi_label');
            $table->json('narasumber_riwayat')->nullable()->after('sosial');
            $table->json('kajian_riwayat')->nullable()->after('narasumber_riwayat');
        });
    }

    public function down(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->dropColumn([
                'institution', 'active_since', 'email', 'kriteria_list', 'keahlian',
                'alamat_lengkap', 'alamat_kota', 'alamat_provinsi', 'lokasi_label',
                'sosial', 'narasumber_riwayat', 'kajian_riwayat',
            ]);
        });
    }
};
