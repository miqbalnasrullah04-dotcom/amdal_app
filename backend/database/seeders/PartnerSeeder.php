<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Partner;

class PartnerSeeder extends Seeder
{
    public function run(): void
    {
        $partners = [
            [
                'name' => 'Universitas Udayana',
                'short' => 'UNUD',
                'logo' => null,
                'type' => 'mou_university',
                'order' => 1,
            ],
            [
                'name' => 'Institut Pertanian Bogor',
                'short' => 'IPB',
                'logo' => null,
                'type' => 'mou_university',
                'order' => 2,
            ],
            [
                'name' => 'Universitas Gadjah Mada',
                'short' => 'UGM',
                'logo' => null,
                'type' => 'mou_university',
                'order' => 3,
            ],
            [
                'name' => 'Kementerian Lingkungan Hidup dan Kehutanan',
                'short' => 'KLHK',
                'logo' => null,
                'type' => 'moa',
                'order' => 4,
            ],
            [
                'name' => 'Badan Riset dan Inovasi Nasional',
                'short' => 'BRIN',
                'logo' => null,
                'type' => 'grant_research',
                'order' => 5,
            ],
        ];

        foreach ($partners as $partner) {
            Partner::create($partner);
        }

        $this->command->info('✓ Partners seeded (5 partners)');
    }
}
