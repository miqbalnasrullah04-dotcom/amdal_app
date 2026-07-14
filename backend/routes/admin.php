<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ExpertController;
use App\Http\Controllers\Admin\PartnerController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login.submit');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    // Menggunakan auth:sanctum agar cocok dengan token localStorage dari React
    Route::middleware(['auth:sanctum'])->group(function () {

        // Memperbaiki Error 500: Mengganti return view() menjadi return response()->json()
        Route::get('/', function () {
            return response()->json([
                'status' => 'success',
                'message' => 'Welcome to Admin Dashboard Data API'
            ]);
        })->name('dashboard');

        Route::resource('categories', CategoryController::class)->except('show');
        Route::resource('experts', ExpertController::class)->except('show');
        Route::resource('partners', PartnerController::class)->except('show');
        Route::resource('articles', ArticleController::class)->except('show');
    });
});
