<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Narasumber/Pembicara', 'icon' => 'MicrophoneIcon', 'order' => 1],
            ['name' => 'Tenaga Ahli', 'icon' => 'BriefcaseIcon', 'order' => 2],
            ['name' => 'Instruktur Pengajar', 'icon' => 'AcademicCapIcon', 'order' => 3],
            ['name' => 'Peneliti Artikel/Jurnal', 'icon' => 'BookOpenIcon', 'order' => 4],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
