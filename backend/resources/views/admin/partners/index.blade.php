@extends('admin.layout')
@section('title', 'Mitra / Partner')

@section('content')
<div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
    <div>
        <h2 class="text-xl font-semibold text-[#3E2B1F]">Mitra / Partner</h2>
        <p class="text-sm text-[#6B4F3A]">MoU Universitas, Grant Research, dan MoA — tampil di landing page.</p>
    </div>
    <div class="flex items-center gap-3">
        <form action="{{ route('admin.partners.index') }}" method="GET">
            <select name="type" onchange="this.form.submit()"
                    class="rounded-full border border-[#3E2B1F]/20 px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
                <option value="">Semua Tipe</option>
                @foreach (\App\Models\Partner::TYPES as $key => $label)
                    <option value="{{ $key }}" @selected(request('type') == $key)>{{ $label }}</option>
                @endforeach
            </select>
        </form>
        <a href="{{ route('admin.partners.create') }}"
           class="bg-[#2E5E3B] hover:bg-[#254B30] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add</span> Tambah Mitra
        </a>
    </div>
</div>

<div class="bg-white rounded-xl border border-[#3E2B1F]/10 overflow-hidden shadow-sm">
    <table class="w-full text-sm">
        <thead class="bg-[#F0E2CE]/50 text-[#3E2B1F]">
            <tr>
                <th class="text-left px-6 py-3 font-semibold">Logo</th>
                <th class="text-left px-6 py-3 font-semibold">Nama</th>
                <th class="text-left px-6 py-3 font-semibold">Singkatan</th>
                <th class="text-left px-6 py-3 font-semibold">Tipe</th>
                <th class="text-left px-6 py-3 font-semibold">Urutan</th>
                <th class="text-right px-6 py-3 font-semibold">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-[#3E2B1F]/10">
            @forelse ($partners as $partner)
                <tr class="hover:bg-[#F5F1E8]/60">
                    <td class="px-6 py-3">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-white border border-[#3E2B1F]/10 flex items-center justify-center">
                            @if ($partner->logo)
                                <img src="{{ asset('storage/'.$partner->logo) }}" class="w-full h-full object-contain p-1">
                            @endif
                        </div>
                    </td>
                    <td class="px-6 py-3 font-medium text-[#3E2B1F]">{{ $partner->name }}</td>
                    <td class="px-6 py-3 text-[#6B4F3A]">{{ $partner->short ?? '-' }}</td>
                    <td class="px-6 py-3">
                        <span class="px-2 py-0.5 rounded-full text-xs bg-[#6B4F3A]/10 text-[#6B4F3A]">{{ \App\Models\Partner::TYPES[$partner->type] }}</span>
                    </td>
                    <td class="px-6 py-3 text-[#6B4F3A]">{{ $partner->order }}</td>
                    <td class="px-6 py-3">
                        <div class="flex justify-end gap-2">
                            <a href="{{ route('admin.partners.edit', $partner) }}"
                               class="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E5E3B]/10 text-[#2E5E3B] hover:bg-[#2E5E3B]/20">Edit</a>
                            <form action="{{ route('admin.partners.destroy', $partner) }}" method="POST"
                                  onsubmit="return confirm('Hapus {{ $partner->name }}?');">
                                @csrf @method('DELETE')
                                <button class="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-6 py-8 text-center text-[#6B4F3A]/60">Belum ada mitra.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $partners->links() }}</div>
@endsection

