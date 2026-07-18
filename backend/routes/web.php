<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return ['Laravel' => app()->version()];
});

// Rute admin (jika ditembak dari frontend via /api/admin/..., sesuaikan grouping-nya di admin.php)
require __DIR__.'/admin.php';
