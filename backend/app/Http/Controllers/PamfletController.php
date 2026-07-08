<?php

namespace App\Http\Controllers;

use App\Models\Pamflet;
use Illuminate\Http\JsonResponse;

class PamfletController extends Controller
{
    // GET /api/pamflet — powers the Pamflet page
    public function index(): JsonResponse
    {
        return response()->json(Pamflet::latest()->get());
    }
}
