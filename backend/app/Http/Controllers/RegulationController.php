<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use Illuminate\Http\JsonResponse;

class RegulationController extends Controller
{
    // GET /api/regulations — powers the Peraturan KLHS page
    public function index(): JsonResponse
    {
        return response()->json(Regulation::orderBy('id')->get());
    }
}
