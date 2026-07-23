<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            // Profil Bio
            $table->text('tentang_saya')->nullable()->after('field');
            $table->text('ringkasan_keahlian')->nullable()->after('tentang_saya');
            $table->json('bidang_utama')->nullable()->after('ringkasan_keahlian');
            
            // Link Akademik (Scopus, Google Scholar, SINTA, ORCID, ResearchGate)
            $table->string('scopus_url')->nullable()->after('sosial');
            $table->string('scopus_metrics')->nullable()->after('scopus_url');
            $table->string('google_scholar_url')->nullable()->after('scopus_metrics');
            $table->string('google_scholar_metrics')->nullable()->after('google_scholar_url');
            $table->string('sinta_url')->nullable()->after('google_scholar_metrics');
            $table->string('sinta_metrics')->nullable()->after('sinta_url');
            $table->string('orcid_url')->nullable()->after('sinta_metrics');
            $table->string('orcid_metrics')->nullable()->after('orcid_url');
            $table->string('researchgate_url')->nullable()->after('orcid_metrics');
            $table->string('researchgate_metrics')->nullable()->after('researchgate_url');
            
            // Reviewer Jurnal
            $table->json('reviewer_jurnal')->nullable()->after('researchgate_metrics');
            
            // Publikasi
            $table->json('publikasi')->nullable()->after('reviewer_jurnal');
            
            // Organisasi
            $table->json('organisasi')->nullable()->after('publikasi');
            
            // Riwayat Instruktur
            $table->json('instruktur')->nullable()->after('organisasi');
        });
    }

    public function down(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->dropColumn([
                'tentang_saya',
                'ringkasan_keahlian',
                'bidang_utama',
                'scopus_url',
                'scopus_metrics',
                'google_scholar_url',
                'google_scholar_metrics',
                'sinta_url',
                'sinta_metrics',
                'orcid_url',
                'orcid_metrics',
                'researchgate_url',
                'researchgate_metrics',
                'reviewer_jurnal',
                'publikasi',
                'organisasi',
                'instruktur',
            ]);
        });
    }
};
