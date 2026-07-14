@php $p = $partner; @endphp

<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Nama Mitra</label>
        <input type="text" name="name" value="{{ old('name', $p->name ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
               placeholder="cth. Universitas Udayana" required>
        @error('name') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Singkatan</label>
        <input type="text" name="short" value="{{ old('short', $p->short ?? '') }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
               placeholder="cth. UNUD">
        @error('short') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Tipe Kerja Sama</label>
        <select name="type"
                class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none" required>
            @foreach (\App\Models\Partner::TYPES as $key => $label)
                <option value="{{ $key }}" @selected(old('type', $p->type ?? '') == $key)>{{ $label }}</option>
            @endforeach
        </select>
        @error('type') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>

    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Urutan Tampil</label>
        <input type="number" name="order" value="{{ old('order', $p->order ?? 0) }}"
               class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
        @error('order') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
    </div>
</div>

<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Logo</label>
    @if (!empty($p?->logo))
        <img src="{{ asset('storage/'.$p->logo) }}" class="w-20 h-20 rounded-full object-contain bg-white border border-[#3E2B1F]/10 mb-2 p-2">
    @endif
    <input type="file" name="logo" accept="image/*"
           class="w-full text-sm text-[#6B4F3A] file:mr-3 file:rounded-full file:border-0 file:bg-[#2E5E3B]/10 file:text-[#2E5E3B] file:px-4 file:py-2 file:text-xs file:font-medium">
    @error('logo') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
</div>
