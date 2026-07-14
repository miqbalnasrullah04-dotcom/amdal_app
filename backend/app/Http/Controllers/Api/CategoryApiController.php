<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryApiController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('order')->orderBy('name')->get()
            ->map(fn (Category $c) => [
                'title' => $c->name,
                'slug' => $c->slug,
                'icon' => $c->icon,
            ]);

        return response()->json($categories);
    }

    public function adminIndex()
    {
        return response()->json(Category::orderBy('order')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = Category::create($validator->validated());

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $category->update($validator->validated());

        return response()->json($category);
    }

    public function destroy($id)
    {
        Category::findOrFail($id)->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
