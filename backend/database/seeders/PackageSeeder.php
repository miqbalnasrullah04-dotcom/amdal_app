<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        Package::updateOrCreate(
            ['slug' => 'biasa'],
            [
                'name' => 'Paket Biasa',
                'price' => 0,
                'description' => 'Profil tayang setelah diverifikasi admin, tanpa biaya.',
                'benefits' => ['Tayang di direktori pencarian', 'Verifikasi standar'],
                'is_active' => true,
                'order' => 1,
            ]
        );

        Package::updateOrCreate(
            ['slug' => 'premium'],
            [
                'name' => 'Paket Premium',
                'price' => 200000,
                'description' => 'Profil tayang lebih cepat dengan badge Premium dan prioritas tampil di pencarian.',
                'benefits' => ['Tayang di direktori pencarian', 'Badge Premium', 'Prioritas di hasil pencarian', 'Verifikasi prioritas'],
                'is_active' => true,
                'order' => 2,
            ]
        );
    }
}
