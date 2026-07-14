<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExpertController extends Controller
{
    public function index(Request $request)
    {
        $experts = Expert::query()
            ->when($request->q, fn ($q) => $q->where('name', 'like', "%{$request->q}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('admin.experts.index', compact('experts'));
    }

    public function create()
    {
        return view('admin.experts.create');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['name']);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('experts/photo', 'public');
        }
        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('experts/cover', 'public');
        }

        Expert::create($data);

        return redirect()->route('admin.experts.index')->with('success', 'Tenaga ahli berhasil ditambahkan.');
    }

    public function edit(Expert $expert)
    {
        return view('admin.experts.edit', compact('expert'));
    }

    public function update(Request $request, Expert $expert)
    {
        $data = $this->validated($request);

        if ($request->hasFile('photo')) {
            if ($expert->photo) Storage::disk('public')->delete($expert->photo);
            $data['photo'] = $request->file('photo')->store('experts/photo', 'public');
        }
        if ($request->hasFile('cover')) {
            if ($expert->cover) Storage::disk('public')->delete($expert->cover);
            $data['cover'] = $request->file('cover')->store('experts/cover', 'public');
        }

        $expert->update($data);

        return redirect()->route('admin.experts.index')->with('success', 'Tenaga ahli berhasil diperbarui.');
    }

    public function destroy(Expert $expert)
    {
        if ($expert->photo) Storage::disk('public')->delete($expert->photo);
        if ($expert->cover) Storage::disk('public')->delete($expert->cover);
        $expert->delete();

        return redirect()->route('admin.experts.index')->with('success', 'Tenaga ahli berhasil dihapus.');
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (
            Expert::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function validated(Request $request): array
    {
        $kriteriaOptions = array_keys(Expert::kriteriaRouteMap());

        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'field'           => 'nullable|string|max:255',
            'kriteria'        => 'required|string|in:'.implode(',', $kriteriaOptions),
            'kriteria_list'   => 'nullable|array',
            'kriteria_list.*' => 'string|in:'.implode(',', $kriteriaOptions),
            'location'        => 'nullable|string|max:255',
            'lat'             => 'nullable|numeric',
            'lng'             => 'nullable|numeric',
            'rating'          => 'nullable|numeric|min:0|max:9.9',
            'institution'     => 'nullable|string|max:255',
            'active_since'    => 'nullable|integer|min:1900|max:'.date('Y'),
            'email'           => 'nullable|email|max:255',
            'alamat_lengkap'  => 'nullable|string|max:255',
            'alamat_kota'     => 'nullable|string|max:255',
            'alamat_provinsi' => 'nullable|string|max:255',
            'lokasi_label'    => 'nullable|string|max:255',
            'photo'           => 'nullable|image|max:2048',
            'cover'           => 'nullable|image|max:4096',

            'keahlian' => 'nullable|string',

            'sosial_instagram' => 'nullable|string|max:255',
            'sosial_linkedin'  => 'nullable|string|max:255',
            'sosial_twitter'   => 'nullable|string|max:255',
            'sosial_website'   => 'nullable|string|max:255',
            'sosial_whatsapp'  => 'nullable|string|max:255',

            'narasumber_judul'         => 'nullable|array',
            'narasumber_penyelenggara' => 'nullable|array',
            'narasumber_tahun'         => 'nullable|array',
            'narasumber_deskripsi'     => 'nullable|array',

            'kajian_judul'     => 'nullable|array',
            'kajian_lokasi'    => 'nullable|array',
            'kajian_tahun'     => 'nullable|array',
            'kajian_deskripsi' => 'nullable|array',
        ]);

        $data['verified'] = $request->boolean('verified');
        $data['featured'] = $request->boolean('featured');
        $data['kriteria_list'] = $request->input('kriteria_list', [$data['kriteria']]);

        $data['keahlian'] = collect(explode("\n", $request->input('keahlian', '')))
            ->map(fn ($v) => trim($v))
            ->filter()
            ->values()
            ->all();

        $data['sosial'] = array_filter([
            'instagram' => $request->input('sosial_instagram'),
            'linkedin'  => $request->input('sosial_linkedin'),
            'twitter'   => $request->input('sosial_twitter'),
            'website'   => $request->input('sosial_website'),
            'whatsapp'  => $request->input('sosial_whatsapp'),
        ]);

        $data['narasumber_riwayat'] = $this->zipRows(
            $request->input('narasumber_judul', []),
            $request->input('narasumber_penyelenggara', []),
            $request->input('narasumber_tahun', []),
            $request->input('narasumber_deskripsi', []),
            ['judul', 'penyelenggara', 'tahun', 'deskripsi']
        );

        $data['kajian_riwayat'] = $this->zipRows(
            $request->input('kajian_judul', []),
            $request->input('kajian_lokasi', []),
            $request->input('kajian_tahun', []),
            $request->input('kajian_deskripsi', []),
            ['judul', 'lokasi', 'tahun', 'deskripsi']
        );

        foreach ([
            'sosial_instagram', 'sosial_linkedin', 'sosial_twitter', 'sosial_website', 'sosial_whatsapp',
            'narasumber_judul', 'narasumber_penyelenggara', 'narasumber_tahun', 'narasumber_deskripsi',
            'kajian_judul', 'kajian_lokasi', 'kajian_tahun', 'kajian_deskripsi',
        ] as $key) {
            unset($data[$key]);
        }

        return $data;
    }

    private function zipRows(array $a, array $b, array $c, array $d, array $keys): array
    {
        $rows = [];
        $count = max(count($a), count($b), count($c), count($d));

        for ($i = 0; $i < $count; $i++) {
            $row = [
                $keys[0] => $a[$i] ?? null,
                $keys[1] => $b[$i] ?? null,
                $keys[2] => $c[$i] ?? null,
                $keys[3] => $d[$i] ?? null,
            ];

            if (array_filter($row, fn ($v) => filled($v))) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}
