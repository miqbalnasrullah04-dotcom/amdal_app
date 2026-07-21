<?php

namespace Database\Seeders;

use App\Models\Expert;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Certificate;
use Illuminate\Database\Seeder;

class ExpertSeeder extends Seeder
{
    public function run(): void
    {
        // Expert 1: Dr. Irman Firmansyah
        $expert1 = Expert::create([
            'slug' => 'dr-irman-firmansyah-s-hut-m-si',
            'name' => 'Dr. Irman Firmansyah, S.Hut, M.Si',
            'field' => 'Kajian Lingkungan Hidup Strategis',
            'kriteria' => 'Tenaga Ahli',
            'kriteria_list' => ['Tenaga Ahli', 'Narasumber/Pembicara', 'Peneliti'],
            'institution' => 'PSL - IPB University',
            'active_since' => 2011,
            'email' => 'irmanf@psl.ipb.ac.id',
            'phone' => '+62812345678901',
            'photo' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
            'cover' => 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1400',
            'verified' => true,
            'featured' => true,
            'profile_status' => 'aktif',
            'rating' => 4.8,
            'alamat_lengkap' => 'Komplek IPB 2, Blok C No. 4 Sindang Barang, Bogor 16117',
            'alamat_kota' => 'Kota Bogor',
            'alamat_provinsi' => 'Jawa Barat',
            'lokasi_label' => 'Jl. Mercurius No.4, RW.5, Ciherang, Kec. Dramaga, Kabupaten Bogor, Jawa Barat 16680',
            'lat' => -6.5622,
            'lng' => 106.7297,
            'keahlian' => ['Ilmu Kehutanan', 'Ilmu Lingkungan', 'System Dynamics', 'Spasial Dynamics'],
            'pengalaman' => 'Bekerja pada irisan antara ilmu kehutanan, lingkungan, dan pemodelan sistem dinamik untuk mendukung perencanaan pembangunan yang berkelanjutan. Selama lebih dari satu dekade terlibat dalam penyusunan KLHS, kajian daya dukung lingkungan, dan pendampingan kebijakan tata ruang di berbagai daerah di Indonesia.',
            'sosial' => [
                ['label' => 'Instagram', 'type' => 'instagram', 'url' => 'https://www.instagram.com/dr.irman/'],
                ['label' => 'Facebook', 'type' => 'facebook', 'url' => 'https://www.facebook.com/wearecase27/'],
                ['label' => 'YouTube', 'type' => 'youtube', 'url' => 'https://www.youtube.com/channel/UCva2ULajnzEhorlabr_yDpA'],
            ],
            'narasumber_riwayat' => [
                [
                    'title' => 'Identifikasi materi KRP & analisis pengaruh KLHS RDTR Kec. Selaawi–Banyuresmi',
                    'penyelenggara' => 'Dinas Lingkungan Hidup Kab. Garut',
                    'tempat' => 'Garut',
                    'tanggal' => '15 Nov 2022'
                ],
                [
                    'title' => 'Penyepakatan isu pembangunan berkelanjutan strategis KLHS RDTR Kec. Selaawi–Banyuresmi',
                    'penyelenggara' => 'Dinas Lingkungan Hidup Kab. Garut',
                    'tempat' => 'Garut',
                    'tanggal' => '21 Sep 2022'
                ],
            ],
        ]);

        // Add Education for Expert 1
        Education::create([
            'expert_id' => $expert1->id,
            'jenjang' => 'S3 · Doktor',
            'institusi' => 'IPB University',
            'jurusan' => 'Ilmu Pengetahuan Kehutanan',
            'tahun_lulus' => 2018,
        ]);

        Education::create([
            'expert_id' => $expert1->id,
            'jenjang' => 'S2 · Magister',
            'institusi' => 'IPB University',
            'jurusan' => 'Ilmu Lingkungan',
            'tahun_lulus' => 2010,
        ]);

        Education::create([
            'expert_id' => $expert1->id,
            'jenjang' => 'S1 · Sarjana',
            'institusi' => 'IPB University',
            'jurusan' => 'Kehutanan',
            'tahun_lulus' => 2006,
        ]);

        // Add Experience for Expert 1
        Experience::create([
            'expert_id' => $expert1->id,
            'posisi' => 'Peneliti & Dosen',
            'instansi' => 'Pusat Studi Lingkungan (PSL), IPB University',
            'tahun_mulai' => 2011,
            'tahun_selesai' => null, // Still working
            'deskripsi' => 'Mengampu riset dan pengajaran pada bidang perencanaan lingkungan, dengan fokus pemodelan sistem dinamik untuk kajian daya dukung wilayah.',
        ]);

        Experience::create([
            'expert_id' => $expert1->id,
            'posisi' => 'Konsultan Lingkungan Independen',
            'instansi' => 'Freelance / Berbagai Pemerintah Daerah',
            'tahun_mulai' => 2013,
            'tahun_selesai' => null,
            'deskripsi' => 'Menyusun dan memfasilitasi Kajian Lingkungan Hidup Strategis (KLHS) untuk RTRW, RDTR, dan RPJMD di lebih dari 15 kabupaten/kota.',
        ]);

        // Add Certificates for Expert 1
        Certificate::create([
            'expert_id' => $expert1->id,
            'nama_sertifikat' => 'Ahli Kajian Lingkungan Hidup Strategis (KLHS)',
            'penerbit' => 'Kementerian Lingkungan Hidup dan Kehutanan',
            'tahun' => 2019,
        ]);

        Certificate::create([
            'expert_id' => $expert1->id,
            'nama_sertifikat' => 'Fasilitator Pemodelan Sistem Dinamik',
            'penerbit' => 'System Dynamics Society Indonesia',
            'tahun' => 2020,
        ]);

        // Expert 2: Prof. Dr. Sari Wijayanti
        $expert2 = Expert::create([
            'slug' => 'prof-dr-sari-wijayanti-m-si',
            'name' => 'Prof. Dr. Sari Wijayanti, M.Si',
            'field' => 'Ekonomi Lingkungan dan Sumber Daya Alam',
            'kriteria' => 'Tenaga Ahli',
            'kriteria_list' => ['Tenaga Ahli', 'Peneliti', 'Instruktur Pengajar'],
            'institution' => 'Fakultas Ekonomi dan Manajemen - IPB University',
            'active_since' => 2008,
            'email' => 'sari.wijayanti@ipb.ac.id',
            'phone' => '+62812345678902',
            'photo' => 'https://images.unsplash.com/photo-1494790108755-2616b332c76c?auto=format&fit=crop&q=80&w=200',
            'cover' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1400',
            'verified' => true,
            'featured' => true,
            'profile_status' => 'aktif',
            'rating' => 4.9,
            'alamat_lengkap' => 'Jl. Kamper, Kampus IPB Dramaga, Bogor 16680',
            'alamat_kota' => 'Kabupaten Bogor',
            'alamat_provinsi' => 'Jawa Barat',
            'lokasi_label' => 'Fakultas Ekonomi dan Manajemen IPB, Jl. Kamper, Dramaga, Bogor',
            'lat' => -6.5588,
            'lng' => 106.7291,
            'keahlian' => ['Ekonomi Lingkungan', 'Valuasi Ekonomi SDA', 'Environmental Accounting', 'Green Economy'],
            'pengalaman' => 'Ahli ekonomi lingkungan dengan spesialisasi valuasi ekonomi sumber daya alam dan jasa ekosistem. Berpengalaman dalam penyusunan kebijakan ekonomi hijau dan instrumen ekonomi lingkungan untuk pembangunan berkelanjutan.',
            'sosial' => [
                ['label' => 'Instagram', 'type' => 'instagram', 'url' => 'https://www.instagram.com/prof.sari/'],
                ['label' => 'Twitter', 'type' => 'twitter', 'url' => 'https://twitter.com/sari_ekonomi'],
            ],
        ]);

        // Add Education for Expert 2
        Education::create([
            'expert_id' => $expert2->id,
            'jenjang' => 'S3 · Doktor',
            'institusi' => 'University of Queensland, Australia',
            'jurusan' => 'Environmental and Resource Economics',
            'tahun_lulus' => 2015,
        ]);

        Education::create([
            'expert_id' => $expert2->id,
            'jenjang' => 'S2 · Magister',
            'institusi' => 'IPB University',
            'jurusan' => 'Ilmu Ekonomi Pertanian',
            'tahun_lulus' => 2008,
        ]);

        // Expert 3: Ir. Bambang Susanto
        Expert::create([
            'slug' => 'ir-bambang-susanto-m-t',
            'name' => 'Ir. Bambang Susanto, M.T',
            'field' => 'Teknik Lingkungan dan Pengelolaan Limbah',
            'kriteria' => 'Tenaga Ahli',
            'kriteria_list' => ['Tenaga Ahli', 'Narasumber/Pembicara'],
            'institution' => 'PT. Enviro Konsultan Indonesia',
            'active_since' => 2005,
            'email' => 'bambang.susanto@enviro.co.id',
            'phone' => '+62812345678903',
            'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            'cover' => 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1400',
            'verified' => true,
            'featured' => false,
            'profile_status' => 'aktif',
            'rating' => 4.7,
            'alamat_lengkap' => 'Jl. Raya Pajajaran No. 123, Bogor Tengah',
            'alamat_kota' => 'Kota Bogor',
            'alamat_provinsi' => 'Jawa Barat',
            'lokasi_label' => 'Jl. Raya Pajajaran No. 123, Bogor Tengah, Bogor',
            'lat' => -6.5944,
            'lng' => 106.8229,
            'keahlian' => ['Teknik Lingkungan', 'Pengelolaan Limbah B3', 'IPAL Industri', 'Environmental Audit'],
            'pengalaman' => 'Praktisi teknik lingkungan dengan pengalaman lebih dari 18 tahun dalam desain dan implementasi sistem pengelolaan lingkungan industri. Spesialis dalam penanganan limbah B3 dan audit lingkungan.',
        ]);
    }
}
