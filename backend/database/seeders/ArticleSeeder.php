<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use Carbon\Carbon;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            [
                'title' => 'Panduan Lengkap AMDAL untuk Pemula',
                'slug' => 'panduan-lengkap-amdal-untuk-pemula',
                'excerpt' => 'Memahami dasar-dasar Analisis Mengenai Dampak Lingkungan (AMDAL) untuk proyek Anda.',
                'content' => 'AMDAL merupakan kajian mengenai dampak penting suatu usaha dan/atau kegiatan yang direncanakan pada lingkungan hidup...',
                'thumbnail' => null,
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'title' => 'Perbedaan AMDAL, UKL-UPL, dan SPPL',
                'slug' => 'perbedaan-amdal-ukl-upl-dan-sppl',
                'excerpt' => 'Kenali perbedaan ketiga dokumen lingkungan ini dan kapan harus menggunakannya.',
                'content' => 'Setiap kegiatan usaha memiliki kewajiban dokumen lingkungan yang berbeda tergantung skala dan dampaknya...',
                'thumbnail' => null,
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'title' => 'Cara Memilih Tenaga Ahli AMDAL yang Tepat',
                'slug' => 'cara-memilih-tenaga-ahli-amdal-yang-tepat',
                'excerpt' => 'Tips memilih konsultan AMDAL yang bersertifikat dan berpengalaman.',
                'content' => 'Memilih tenaga ahli yang tepat sangat penting untuk kesuksesan proyek Anda...',
                'thumbnail' => null,
                'published_at' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($articles as $article) {
            Article::create($article);
        }

        $this->command->info('✓ Articles seeded (3 articles)');
    }
}
