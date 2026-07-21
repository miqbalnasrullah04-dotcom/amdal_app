<?php

namespace Database\Seeders;

use App\Models\Expert;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Certificate;
use Illuminate\Database\Seeder;

class ExpertRelationsSeeder extends Seeder
{
    public function run(): void
    {
        // Find Dr. Irman expert
        $expert = Expert::where('slug', 'dr-irman-firmansyah-s-hut-m-si')->first();
        
        if (!$expert) {
            echo "Expert not found!\n";
            return;
        }

        // Clear existing relations
        $expert->educations()->delete();
        $expert->experiences()->delete();
        $expert->certificates()->delete();

        // Add Education
        Education::create([
            'expert_id' => $expert->id,
            'jenjang' => 'S3 · Doktor',
            'institusi' => 'IPB University',
            'jurusan' => 'Ilmu Pengetahuan Kehutanan',
            'tahun_lulus' => 2018,
        ]);

        Education::create([
            'expert_id' => $expert->id,
            'jenjang' => 'S2 · Magister',
            'institusi' => 'IPB University',
            'jurusan' => 'Ilmu Lingkungan',
            'tahun_lulus' => 2010,
        ]);

        Education::create([
            'expert_id' => $expert->id,
            'jenjang' => 'S1 · Sarjana',
            'institusi' => 'IPB University',
            'jurusan' => 'Kehutanan',
            'tahun_lulus' => 2006,
        ]);

        // Add Experience
        Experience::create([
            'expert_id' => $expert->id,
            'posisi' => 'Peneliti & Dosen',
            'instansi' => 'Pusat Studi Lingkungan (PSL), IPB University',
            'tahun_mulai' => 2011,
            'tahun_selesai' => null,
            'deskripsi' => 'Mengampu riset dan pengajaran pada bidang perencanaan lingkungan, dengan fokus pemodelan sistem dinamik untuk kajian daya dukung wilayah.',
        ]);

        Experience::create([
            'expert_id' => $expert->id,
            'posisi' => 'Konsultan Lingkungan Independen',
            'instansi' => 'Freelance / Berbagai Pemerintah Daerah',
            'tahun_mulai' => 2013,
            'tahun_selesai' => null,
            'deskripsi' => 'Menyusun dan memfasilitasi Kajian Lingkungan Hidup Strategis (KLHS) untuk RTRW, RDTR, dan RPJMD di lebih dari 15 kabupaten/kota.',
        ]);

        Experience::create([
            'expert_id' => $expert->id,
            'posisi' => 'Tenaga Ahli Pendamping',
            'instansi' => 'Kementerian Lingkungan Hidup dan Kehutanan',
            'tahun_mulai' => 2016,
            'tahun_selesai' => 2020,
            'deskripsi' => 'Mendampingi penyusunan pedoman teknis integrasi KLHS ke dalam dokumen rencana tata ruang daerah.',
        ]);

        // Add Certificates
        Certificate::create([
            'expert_id' => $expert->id,
            'nama_sertifikat' => 'Ahli Kajian Lingkungan Hidup Strategis (KLHS)',
            'penerbit' => 'Kementerian Lingkungan Hidup dan Kehutanan',
            'tahun' => 2019,
        ]);

        Certificate::create([
            'expert_id' => $expert->id,
            'nama_sertifikat' => 'Fasilitator Pemodelan Sistem Dinamik',
            'penerbit' => 'System Dynamics Society Indonesia',
            'tahun' => 2020,
        ]);

        Certificate::create([
            'expert_id' => $expert->id,
            'nama_sertifikat' => 'Ahli Madya Perencanaan Wilayah dan Kota',
            'penerbit' => 'Lembaga Pengembangan Jasa Konstruksi (LPJK)',
            'tahun' => 2021,
        ]);

        echo "✅ Successfully added relations for Dr. Irman Firmansyah\n";
        echo "   - 3 Education records\n";
        echo "   - 3 Experience records\n";
        echo "   - 3 Certificate records\n";
    }
}