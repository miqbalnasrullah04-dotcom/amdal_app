<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pamflet;
use Carbon\Carbon;

class PamfletSeeder extends Seeder
{
    public function run(): void
    {
        $pamflets = [
            [
                'title' => 'Pelatihan Analisis AMDAL Tingkat Lanjut',
                'description' => 'Pelatihan intensif untuk para praktisi lingkungan dalam menganalisis dokumen AMDAL dengan metode terkini.',
                'type' => 'training',
                'event_date' => Carbon::now()->addDays(30),
                'location' => 'Jakarta Convention Center',
                'organizer' => 'TenagaAhli.com & Kementerian Lingkungan Hidup',
                'is_published' => true,
                'order' => 1,
            ],
            [
                'title' => 'Seminar Nasional Kebijakan Lingkungan 2026',
                'description' => 'Diskusi komprehensif mengenai kebijakan lingkungan terbaru dan implementasinya di Indonesia.',
                'type' => 'seminar',
                'event_date' => Carbon::now()->addDays(45),
                'location' => 'Balai Kartini, Jakarta',
                'organizer' => 'Asosiasi Ahli Lingkungan Indonesia',
                'is_published' => true,
                'order' => 2,
            ],
            [
                'title' => 'Workshop Penyusunan Dokumen UKL-UPL',
                'description' => 'Panduan praktis menyusun dokumen UKL-UPL sesuai dengan peraturan perundang-undangan yang berlaku.',
                'type' => 'workshop',
                'event_date' => Carbon::now()->addDays(20),
                'location' => 'Hotel Borobudur, Jakarta',
                'organizer' => 'TenagaAhli.com',
                'is_published' => true,
                'order' => 3,
            ],
            [
                'title' => 'Pengumuman: Pendaftaran Tenaga Ahli Bersertifikat',
                'description' => 'Buka pendaftaran untuk tenaga ahli yang ingin bergabung dengan platform TenagaAhli.com.',
                'type' => 'announcement',
                'event_date' => null,
                'location' => null,
                'organizer' => 'TenagaAhli.com',
                'is_published' => true,
                'order' => 4,
            ],
            [
                'title' => 'Training: Sertifikasi Kompetensi Lingkungan',
                'description' => 'Program sertifikasi untuk meningkatkan kompetensi tenaga ahli di bidang lingkungan.',
                'type' => 'training',
                'event_date' => Carbon::now()->addDays(60),
                'location' => 'Gedung BNSP, Jakarta',
                'organizer' => 'BNSP & TenagaAhli.com',
                'is_published' => false,
                'order' => 5,
            ],
        ];

        foreach ($pamflets as $pamflet) {
            Pamflet::create($pamflet);
        }
    }
}
