<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Rute admin (jika ditembak dari frontend via /api/admin/..., sesuaikan grouping-nya di admin.php)
require __DIR__.'/admin.php';
