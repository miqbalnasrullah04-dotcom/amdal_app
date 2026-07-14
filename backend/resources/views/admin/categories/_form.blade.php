@php $c = $category; @endphp

<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Nama Kategori</label>
    <input type="text" name="name" value="{{ old('name', $c->name ?? '') }}"
           class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
           placeholder="cth. Narasumber/Pembicara" required>
    @error('name') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
</div>

<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Nama Ikon (Heroicons)</label>
    <input type="text" name="icon" value="{{ old('icon', $c->icon ?? '') }}"
           class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none"
           placeholder="cth. MicrophoneIcon">
    @error('icon') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
</div>

<div>
    <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Urutan Tampil</label>
    <input type="number" name="order" value="{{ old('order', $c->order ?? 0) }}"
           class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
    @error('order') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
</div>
