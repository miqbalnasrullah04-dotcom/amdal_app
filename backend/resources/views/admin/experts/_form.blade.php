@php
    $e = $expert;
    $kriteriaOptions = \App\Models\Expert::kriteriaRouteMap();
    $selectedKriteriaList = old('kriteria_list', $e->kriteria_list ?? ($e->kriteria ? [$e->kriteria] : []));
    $sosial = old('sosial', $e->sosial ?? []);
    $narasumber = old('narasumber_riwayat', $e->narasumber_riwayat ?? []);
    $kajian = old('kajian_riwayat', $e->kajian_riwayat ?? []);
@endphp

{{-- ============ DATA UTAMA ============ --}}
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Nama Lengkap</label>
        <input type="text" name="name" value="{{ old('name', $e->name ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
               placeholder="cth. Dr. Irman Firmansyah, S.Hut, M.Si" required>
        @error('name') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Bidang (field)</label>
        <input type="text" name="field" value="{{ old('field', $e->field ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
               placeholder="cth. Kehutanan, Tata Ruang">
        @error('field') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Kriteria Utama</label>
        <select name="kriteria"
                class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none" required>
            <option value="">— Pilih Kriteria —</option>
            @foreach ($kriteriaOptions as $label => $to)
                <option value="{{ $label }}" @selected(old('kriteria', $e->kriteria ?? '') == $label)>{{ $label }}</option>
            @endforeach
        </select>
        @error('kriteria') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Kriteria Tambahan (opsional)</label>
        <div class="flex flex-wrap gap-4 pt-2.5">
            @foreach ($kriteriaOptions as $label => $to)
                <label class="flex items-center gap-2 text-sm text-[#3E2B1F]">
                    <input type="checkbox" name="kriteria_list[]" value="{{ $label }}"
                           @checked(in_array($label, (array) $selectedKriteriaList))
                           class="rounded border-[#3E2B1F]/30 text-[#2E5E3B] focus:ring-[#2E5E3B]">
                    {{ $label }}
                </label>
            @endforeach
        </div>
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Institusi</label>
        <input type="text" name="institution" value="{{ old('institution', $e->institution ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('institution') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Aktif Sejak (tahun)</label>
        <input type="number" name="active_since" value="{{ old('active_since', $e->active_since ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
               placeholder="cth. 2015" min="1900" max="{{ date('Y') }}">
        @error('active_since') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Email</label>
        <input type="email" name="email" value="{{ old('email', $e->email ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('email') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Rating (0 - 5)</label>
        <input type="number" step="0.1" min="0" max="5" name="rating" value="{{ old('rating', $e->rating ?? 0) }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('rating') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>
</div>

{{-- ============ KEAHLIAN ============ --}}
<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Keahlian (1 baris = 1 item)</label>
    <textarea name="keahlian" rows="4"
              class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
              placeholder="AMDAL&#10;Tata Ruang Wilayah&#10;Kajian Lingkungan Strategis">{{ old('keahlian', is_array($e->keahlian ?? null) ? implode("\n", $e->keahlian) : '') }}</textarea>
    @error('keahlian') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
</div>

{{-- ============ LOKASI & ALAMAT ============ --}}
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Lokasi (Kota/Kab/Provinsi singkat)</label>
        <input type="text" name="location" value="{{ old('location', $e->location ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('location') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Label Lokasi (untuk peta)</label>
        <input type="text" name="lokasi_label" value="{{ old('lokasi_label', $e->lokasi_label ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('lokasi_label') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Latitude</label>
        <input type="number" step="0.0000001" name="lat" value="{{ old('lat', $e->lat ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('lat') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Longitude</label>
        <input type="number" step="0.0000001" name="lng" value="{{ old('lng', $e->lng ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('lng') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div class="md:col-span-2">
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Alamat Lengkap</label>
        <input type="text" name="alamat_lengkap" value="{{ old('alamat_lengkap', $e->alamat_lengkap ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('alamat_lengkap') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Kota</label>
        <input type="text" name="alamat_kota" value="{{ old('alamat_kota', $e->alamat_kota ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('alamat_kota') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Provinsi</label>
        <input type="text" name="alamat_provinsi" value="{{ old('alamat_provinsi', $e->alamat_provinsi ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('alamat_provinsi') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>
</div>

{{-- ============ FOTO ============ --}}
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Foto Profil</label>
        @if (!empty($e?->photo))
            <img src="{{ asset('storage/'.$e->photo) }}" class="w-16 h-16 rounded-full object-cover mb-2 border border-[#3E2B1F]/10">
        @endif
        <input type="file" name="photo" accept="image/*"
               class="w-full text-sm text-[#6B4F3A] file:mr-3 file:rounded-full file:border-0 file:bg-[#2E5E3B]/10 file:text-[#2E5E3B] file:px-4 file:py-2 file:text-xs file:font-medium">
        @error('photo') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Foto Cover</label>
        @if (!empty($e?->cover))
            <img src="{{ asset('storage/'.$e->cover) }}" class="w-28 h-16 rounded-lg object-cover mb-2 border border-[#3E2B1F]/10">
        @endif
        <input type="file" name="cover" accept="image/*"
               class="w-full text-sm text-[#6B4F3A] file:mr-3 file:rounded-full file:border-0 file:bg-[#2E5E3B]/10 file:text-[#2E5E3B] file:px-4 file:py-2 file:text-xs file:font-medium">
        @error('cover') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>
</div>

{{-- ============ SOSIAL MEDIA ============ --}}
<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-2">Media Sosial</label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="sosial_instagram" value="{{ $sosial['instagram'] ?? '' }}" placeholder="Instagram (username / URL)"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        <input type="text" name="sosial_linkedin" value="{{ $sosial['linkedin'] ?? '' }}" placeholder="LinkedIn"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        <input type="text" name="sosial_twitter" value="{{ $sosial['twitter'] ?? '' }}" placeholder="Twitter / X"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        <input type="text" name="sosial_website" value="{{ $sosial['website'] ?? '' }}" placeholder="Website"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        <input type="text" name="sosial_whatsapp" value="{{ $sosial['whatsapp'] ?? '' }}" placeholder="WhatsApp"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
    </div>
</div>

{{-- ============ RIWAYAT NARASUMBER (dinamis) ============ --}}
<div>
    <div class="flex items-center justify-between mb-2">
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A]">Riwayat Narasumber</label>
        <button type="button" onclick="addRow('narasumber-rows', narasumberTemplate)"
                class="text-xs text-[#2E5E3B] font-medium hover:underline">+ Tambah Baris</button>
    </div>
    <div id="narasumber-rows" class="space-y-3">
        @forelse ($narasumber as $i => $row)
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#F5F1E8] p-3 rounded-lg relative">
                <input type="text" name="narasumber_judul[]" value="{{ $row['judul'] ?? '' }}" placeholder="Judul acara"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <input type="text" name="narasumber_penyelenggara[]" value="{{ $row['penyelenggara'] ?? '' }}" placeholder="Penyelenggara"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <input type="text" name="narasumber_tahun[]" value="{{ $row['tahun'] ?? '' }}" placeholder="Tahun"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <div class="flex gap-2">
                    <input type="text" name="narasumber_deskripsi[]" value="{{ $row['deskripsi'] ?? '' }}" placeholder="Deskripsi"
                           class="flex-1 rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                    <button type="button" onclick="this.closest('div.grid').remove()" class="text-red-600 text-xs px-2">✕</button>
                </div>
            </div>
        @empty
        @endforelse
    </div>
</div>

{{-- ============ RIWAYAT KAJIAN (dinamis) ============ --}}
<div>
    <div class="flex items-center justify-between mb-2">
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A]">Riwayat Kajian</label>
        <button type="button" onclick="addRow('kajian-rows', kajianTemplate)"
                class="text-xs text-[#2E5E3B] font-medium hover:underline">+ Tambah Baris</button>
    </div>
    <div id="kajian-rows" class="space-y-3">
        @forelse ($kajian as $i => $row)
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#F5F1E8] p-3 rounded-lg relative">
                <input type="text" name="kajian_judul[]" value="{{ $row['judul'] ?? '' }}" placeholder="Judul kajian"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <input type="text" name="kajian_lokasi[]" value="{{ $row['lokasi'] ?? '' }}" placeholder="Lokasi"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <input type="text" name="kajian_tahun[]" value="{{ $row['tahun'] ?? '' }}" placeholder="Tahun"
                       class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <div class="flex gap-2">
                    <input type="text" name="kajian_deskripsi[]" value="{{ $row['deskripsi'] ?? '' }}" placeholder="Deskripsi"
                           class="flex-1 rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                    <button type="button" onclick="this.closest('div.grid').remove()" class="text-red-600 text-xs px-2">✕</button>
                </div>
            </div>
        @empty
        @endforelse
    </div>
</div>

{{-- ============ STATUS ============ --}}
<div class="flex items-center gap-8 pt-2">
    <label class="flex items-center gap-2 text-sm text-[#3E2B1F]">
        <input type="checkbox" name="verified" value="1" @checked(old('verified', $e->verified ?? false))
               class="rounded border-[#3E2B1F]/30 text-[#2E5E3B] focus:ring-[#2E5E3B]">
        Verified
    </label>
    <label class="flex items-center gap-2 text-sm text-[#3E2B1F]">
        <input type="checkbox" name="featured" value="1" @checked(old('featured', $e->featured ?? false))
               class="rounded border-[#3E2B1F]/30 text-[#2E5E3B] focus:ring-[#2E5E3B]">
        Featured (tampil di landing page)
    </label>
</div>

{{-- JS untuk tombol tambah baris dinamis --}}
<script>
    const narasumberTemplate = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#F5F1E8] p-3 rounded-lg relative">
            <input type="text" name="narasumber_judul[]" placeholder="Judul acara" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <input type="text" name="narasumber_penyelenggara[]" placeholder="Penyelenggara" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <input type="text" name="narasumber_tahun[]" placeholder="Tahun" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <div class="flex gap-2">
                <input type="text" name="narasumber_deskripsi[]" placeholder="Deskripsi" class="flex-1 rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <button type="button" onclick="this.closest('div.grid').remove()" class="text-red-600 text-xs px-2">✕</button>
            </div>
        </div>`;

    const kajianTemplate = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#F5F1E8] p-3 rounded-lg relative">
            <input type="text" name="kajian_judul[]" placeholder="Judul kajian" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <input type="text" name="kajian_lokasi[]" placeholder="Lokasi" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <input type="text" name="kajian_tahun[]" placeholder="Tahun" class="rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
            <div class="flex gap-2">
                <input type="text" name="kajian_deskripsi[]" placeholder="Deskripsi" class="flex-1 rounded-lg border border-[#3E2B1F]/20 px-3 py-2 text-sm">
                <button type="button" onclick="this.closest('div.grid').remove()" class="text-red-600 text-xs px-2">✕</button>
            </div>
        </div>`;

    function addRow(containerId, template) {
        document.getElementById(containerId).insertAdjacentHTML('beforeend', template);
    }
</script>
