<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpertController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\PamfletController;

/*
|--------------------------------------------------------------------------
| API Routes — mirrors every fetch call made from the React frontend.
| Base URL in production: https://your-domain.com/api
|--------------------------------------------------------------------------
*/

// Public
Route::get('/stats', [StatController::class, 'index']);
Route::get('/experts', [ExpertController::class, 'index']);
Route::get('/experts/{expert}', [ExpertController::class, 'show']);
Route::get('/regulations', [RegulationController::class, 'index']);
Route::get('/pamflet', [PamfletController::class, 'index']);

// Auth (used by SignIn.jsx and Daftar.jsx)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected (requires the Bearer token issued by /login or /register)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
