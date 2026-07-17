<?php

use App\Http\Controllers\Api\ArticleApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ExpertController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PartnerApiController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/experts', [ExpertController::class, 'index']);
Route::get('/experts/{slug}', [ExpertController::class, 'show']);

Route::get('/partners', [PartnerApiController::class, 'index']);
Route::get('/articles', [ArticleApiController::class, 'index']);
Route::get('/articles/{slug}', [ArticleApiController::class, 'show']);
Route::get('/categories', [CategoryApiController::class, 'index']);
Route::get('/packages', [PackageController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/change-password', [AuthController::class, 'changePassword']);

    // Dashboard user - profil sendiri
    Route::get('/my/profile', [ExpertController::class, 'myProfile']);
    Route::post('/my/profile', [ExpertController::class, 'saveProfile']);
    Route::post('/my/profile/submit', [ExpertController::class, 'submitForVerification']);

    Route::get('/my/educations', [EducationController::class, 'index']);
    Route::post('/my/educations', [EducationController::class, 'store']);
    Route::put('/my/educations/{id}', [EducationController::class, 'update']);
    Route::delete('/my/educations/{id}', [EducationController::class, 'destroy']);

    Route::get('/my/experiences', [ExperienceController::class, 'index']);
    Route::post('/my/experiences', [ExperienceController::class, 'store']);
    Route::put('/my/experiences/{id}', [ExperienceController::class, 'update']);
    Route::delete('/my/experiences/{id}', [ExperienceController::class, 'destroy']);

    Route::get('/my/certificates', [CertificateController::class, 'index']);
    Route::post('/my/certificates', [CertificateController::class, 'store']);
    Route::delete('/my/certificates/{id}', [CertificateController::class, 'destroy']);

    Route::get('/my/documents', [DocumentController::class, 'index']);
    Route::post('/my/documents', [DocumentController::class, 'store']);
    Route::delete('/my/documents/{id}', [DocumentController::class, 'destroy']);

    // Paket & pembayaran (user)
    Route::post('/my/choose-package', [OrderController::class, 'choosePackage']);
    Route::get('/orders/mine', [OrderController::class, 'myOrder']);
    Route::post('/orders/{id}/upload-proof', [OrderController::class, 'uploadProof']);
    Route::get('/orders/history', [OrderController::class, 'myOrders']);

    // Endpoint khusus admin: data mentah
    Route::get('/admin/experts', [ExpertController::class, 'adminIndex']);
    Route::post('/admin/experts/{id}/verify-profile', [ExpertController::class, 'verifyProfile']);
    Route::post('/admin/experts/{id}/reject-profile', [ExpertController::class, 'rejectProfile']);

    Route::get('/admin/articles', [ArticleApiController::class, 'adminIndex']);
    Route::get('/admin/categories', [CategoryApiController::class, 'adminIndex']);
    Route::get('/admin/partners', [PartnerApiController::class, 'adminIndex']);
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::post('/admin/orders/{id}/verify', [OrderController::class, 'verify']);
    Route::post('/admin/orders/{id}/reject', [OrderController::class, 'reject']);

    Route::get('/admin/packages', [PackageController::class, 'adminIndex']);
    Route::post('/admin/packages', [PackageController::class, 'store']);
    Route::put('/admin/packages/{id}', [PackageController::class, 'update']);
    Route::delete('/admin/packages/{id}', [PackageController::class, 'destroy']);

    // Admin - dashboard stats, deactivate, change password
    Route::get('/admin/dashboard-stats', [ExpertController::class, 'dashboardStats']);
    Route::post('/admin/experts/{id}/deactivate', [ExpertController::class, 'deactivateProfile']);
    Route::put('/admin/change-password', [AuthController::class, 'changePassword']);

    // CRUD Admin - Experts (manual, oleh admin sendiri)
    Route::post('/experts', [ExpertController::class, 'store']);
    Route::put('/experts/{id}', [ExpertController::class, 'update']);
    Route::delete('/experts/{id}', [ExpertController::class, 'destroy']);

    Route::post('/articles', [ArticleApiController::class, 'store']);
    Route::put('/articles/{id}', [ArticleApiController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleApiController::class, 'destroy']);

    Route::post('/categories', [CategoryApiController::class, 'store']);
    Route::put('/categories/{id}', [CategoryApiController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryApiController::class, 'destroy']);

    Route::post('/partners', [PartnerApiController::class, 'store']);
    Route::put('/partners/{id}', [PartnerApiController::class, 'update']);
    Route::delete('/partners/{id}', [PartnerApiController::class, 'destroy']);
});
