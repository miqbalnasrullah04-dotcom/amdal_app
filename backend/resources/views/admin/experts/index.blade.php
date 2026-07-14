@extends('admin.layout')
@section('title', 'Tenaga Ahli')

@section('content')
<div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
    <div>
        <h2 class="text-xl font-semibold text-[#3E2B1F]">Tenaga Ahli / Narasumber</h2>
        <p class="text-sm text-[#6B4F3A]">Data ini tampil di halaman "Cari Tenaga Ahli" &amp; landing page.</p>
    </div>
    <div class="flex items-center gap-3">
        <form action="{{ route('admin.experts.index') }}" method="GET">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari nama..."
                   class="rounded-full border border-[#3E2B1F]/20 px-4 py-2 text-sm w-56 focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        </form>
        <a href="{{ route('admin.experts.create') }}"
           class="bg-[#2E5E3B] hover:bg-[#254B30] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add</span> Tambah Ahli
        </a>
    </div>
</div>

<div class="bg-white rounded-xl border border-[#3E2B1F]/10 overflow-hidden shadow-sm">
    <table class="w-full text-sm">
        <thead class="bg-[#F0E2CE]/50 text-[#3E2B1F]">
            <tr>
                <th class="text-left px-6 py-3 font-semibold">Foto</th>
                <th class="text-left px-6 py-3 font-semibold">Nama</th>
                <th class="text-left px-6 py-3 font-semibold">Kriteria</th>
                <th class="text-left px-6 py-3 font-semibold">Lokasi</th>
                <th class="text-left px-6 py-3 font-semibold">Status</th>
                <th class="text-right px-6 py-3 font-semibold">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-[#3E2B1F]/10">
            @forelse ($experts as $expert)
                <tr class="hover:bg-[#F5F1E8]/60">
                    <td class="px-6 py-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden bg-[#F0E2CE] border border-[#3E2B1F]/10">
                            @if ($expert->photo)
                                <img src="{{ asset('storage/'.$expert->photo) }}" class="w-full h-full object-cover">
                            @endif
                        </div>
                    </td>
                    <td class="px-6 py-3 font-medium text-[#3E2B1F]">{{ $expert->name }}</td>
                    <td class="px-6 py-3 text-[#6B4F3A]">{{ $expert->kriteria ?? '-' }}</td>
                    <td class="px-6 py-3 text-[#6B4F3A]">{{ $expert->location ?? '-' }}</td>
                    <td class="px-6 py-3">
                        <div class="flex gap-1.5 flex-wrap">
                            @if ($expert->verified)
                                <span class="px-2 py-0.5 rounded-full text-xs bg-[#2E5E3B]/10 text-[#2E5E3B]">Verified</span>
                            @endif
                            @if ($expert->featured)
                                <span class="px-2 py-0.5 rounded-full text-xs bg-[#6B4F3A]/10 text-[#6B4F3A]">Featured</span>
                            @endif
                        </div>
                    </td>
                    <td class="px-6 py-3">
                        <div class="flex justify-end gap-2">
                            <a href="{{ route('admin.experts.edit', $expert) }}"
                               class="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E5E3B]/10 text-[#2E5E3B] hover:bg-[#2E5E3B]/20">Edit</a>
                            <form action="{{ route('admin.experts.destroy', $expert) }}" method="POST"
                                  onsubmit="return confirm('Hapus {{ $expert->name }}?');">
                                @csrf @method('DELETE')
                                <button class="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-6 py-8 text-center text-[#6B4F3A]/60">Belum ada data tenaga ahli.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $experts->links() }}</div>
@endsection
