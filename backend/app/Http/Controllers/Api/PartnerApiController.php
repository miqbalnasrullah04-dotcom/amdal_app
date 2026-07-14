<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PartnerApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Partner::orderBy('order')->orderBy('name');

        if ($request->filled('type')) {
            $partners = $query->where('type', $request->type)->get();
            return response()->json($this->transform($partners));
        }

        $all = $query->get()->groupBy('type');

        return response()->json([
            'mou_university' => $this->transform($all->get('mou_university', collect())),
            'grant_research' => $this->transform($all->get('grant_research', collect())),
            'moa' => $this->transform($all->get('moa', collect())),
        ]);
    }

    private function transform($partners)
    {
        return $partners->map(fn (Partner $p) => [
            'name' => $p->name,
            'short' => $p->short,
            'logo' => $p->logo_url,
        ])->values();
    }

    public function adminIndex()
    {
        return response()->json(Partner::orderBy('order')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'short' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'type' => ['required', 'in:mou_university,grant_research,moa'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $partner = Partner::create($validator->validated());

        return response()->json($partner, 201);
    }

    public function update(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'short' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'type' => ['required', 'in:mou_university,grant_research,moa'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $partner->update($validator->validated());

        return response()->json($partner);
    }

    public function destroy($id)
    {
        Partner::findOrFail($id)->delete();

        return response()->json(['message' => 'Mitra berhasil dihapus']);
    }
}
