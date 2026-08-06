<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pamflet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PamfletController extends Controller
{
    public function index(Request $request)
    {
        $query = Pamflet::query()->orderBy('order', 'asc')->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        if ($request->has('keyword')) {
            $keyword = $request->keyword;
            $query->where(function($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%")
                  ->orWhere('organizer', 'like', "%{$keyword}%");
            });
        }

        $pamflets = $query->get();

        return response()->json($pamflets);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'type' => 'nullable|string|max:100',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'title',
            'description',
            'type',
            'event_date',
            'location',
            'organizer',
            'is_published',
            'order',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imagePath = $image->store('pamflets/images', 'public');
            $data['image'] = $imagePath;
        }

        $pamflet = Pamflet::create($data);

        return response()->json([
            'message' => 'Pamflet berhasil dibuat',
            'data' => $pamflet
        ], 201);
    }

    public function show($id)
    {
        $pamflet = Pamflet::findOrFail($id);
        return response()->json($pamflet);
    }

    public function update(Request $request, $id)
    {
        $pamflet = Pamflet::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'type' => 'nullable|string|max:100',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'title',
            'description',
            'type',
            'event_date',
            'location',
            'organizer',
            'is_published',
            'order',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($pamflet->image) {
                Storage::disk('public')->delete($pamflet->image);
            }

            $image = $request->file('image');
            $imagePath = $image->store('pamflets/images', 'public');
            $data['image'] = $imagePath;
        }

        $pamflet->update($data);

        return response()->json([
            'message' => 'Pamflet berhasil diperbarui',
            'data' => $pamflet
        ]);
    }

    public function destroy($id)
    {
        $pamflet = Pamflet::findOrFail($id);

        // Delete associated image
        if ($pamflet->image) {
            Storage::disk('public')->delete($pamflet->image);
        }

        $pamflet->delete();

        return response()->json([
            'message' => 'Pamflet berhasil dihapus'
        ]);
    }
}
