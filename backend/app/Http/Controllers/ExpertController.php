<?php

namespace App\Http\Controllers;

use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExpertController extends Controller
{
    // GET /api/experts?keyword=&lokasi=&kategori=&featured=
    public function index(Request $request): JsonResponse
    {
        $query = Expert::query();

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->keyword}%")
                  ->orWhere('keahlian', 'like', "%{$request->keyword}%");
            });
        }

        if ($request->filled('lokasi')) {
            $query->where('lokasi', 'like', "%{$request->lokasi}%");
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return response()->json($query->latest()->get());
    }

    // GET /api/experts/{expert} — used when the Member page links to a profile
    public function show(Expert $expert): JsonResponse
    {
        return response()->json($expert);
    }
}
