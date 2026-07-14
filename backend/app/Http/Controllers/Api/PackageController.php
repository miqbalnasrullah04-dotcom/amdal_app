<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::where('is_active', true)->orderBy('order')->get());
    }

    // ================== ADMIN ==================

    public function adminIndex()
    {
        return response()->json(Package::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'benefits' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        $package = Package::create($data);

        return response()->json($package, 201);
    }

    public function update(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'benefits' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $package->update($validator->validated());

        return response()->json($package);
    }

    public function destroy($id)
    {
        Package::findOrFail($id)->delete();

        return response()->json(['message' => 'Paket berhasil dihapus']);
    }
}
