<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $partners = Partner::when($request->type, fn ($q) => $q->where('type', $request->type))
            ->orderBy('type')->orderBy('order')->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return view('admin.partners.index', compact('partners'));
    }

    public function create()
    {
        return view('admin.partners.create');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('partners', 'public');
        }

        Partner::create($data);

        return redirect()->route('admin.partners.index')->with('success', 'Mitra berhasil ditambahkan.');
    }

    public function edit(Partner $partner)
    {
        return view('admin.partners.edit', compact('partner'));
    }

    public function update(Request $request, Partner $partner)
    {
        $data = $this->validated($request);

        if ($request->hasFile('logo')) {
            if ($partner->logo) Storage::disk('public')->delete($partner->logo);
            $data['logo'] = $request->file('logo')->store('partners', 'public');
        }

        $partner->update($data);

        return redirect()->route('admin.partners.index')->with('success', 'Mitra berhasil diperbarui.');
    }

    public function destroy(Partner $partner)
    {
        if ($partner->logo) Storage::disk('public')->delete($partner->logo);
        $partner->delete();

        return redirect()->route('admin.partners.index')->with('success', 'Mitra berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'  => 'required|string|max:255',
            'short' => 'nullable|string|max:50',
            'type'  => 'required|in:mou_university,grant_research,moa',
            'order' => 'nullable|integer',
            'logo'  => 'nullable|image|max:2048',
        ]);
    }
}
