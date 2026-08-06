<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pamflet;
use Illuminate\Http\Request;

class PamfletApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pamflet::query()
            ->where('is_published', true)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        $pamflets = $query->get();

        // Add full URL for images
        $pamflets = $pamflets->map(function ($pamflet) {
            if ($pamflet->image) {
                $pamflet->image_url = asset('storage/' . $pamflet->image);
            } else {
                $pamflet->image_url = null;
            }
            return $pamflet;
        });

        return response()->json($pamflets);
    }

    public function show($id)
    {
        $pamflet = Pamflet::where('is_published', true)->findOrFail($id);

        if ($pamflet->image) {
            $pamflet->image_url = asset('storage/' . $pamflet->image);
        }

        return response()->json($pamflet);
    }
}
