<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class StatController extends Controller
{
    // GET /api/stats — powers the 4 stat cards on the Home hero section
    public function index(): JsonResponse
    {
        return response()->json([
            'experts'   => '1,240+',
            'projects'  => '580+',
            'provinces' => '34',
            'legality'  => '100%',
        ]);
    }
}
