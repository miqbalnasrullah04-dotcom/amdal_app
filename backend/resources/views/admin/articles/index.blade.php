@extends('admin.layout')
@section('title', 'Berita / Pamflet')

@section('content')
<div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
    <div>
        <h2 class="text-xl font-semibold text-[#3E2B1F]">Berita / Pamflet</h2>
        <p class="text-sm text-[#6B4F3A]">Konten yang tampil di halaman "Berita Kajian Lingkungan Hidup Strategis".</p>
    </div>
    <div class="flex items-center gap-3">
        <form action="{{ route('admin.articles.index') }}" method="GET">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari judul..."
                   class="rounded-full border border-[#3E2B1F]/20 px-4 py-2 text-sm w-56 focus:ring-2 focus:ring-[#2E5E3B]/40 outline-none">
        </form>
        <a href="{{ route('admin.articles.create') }}"
           class="bg-[#2E5E3B] hover:bg-[#254B30] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add</span> Tambah Berita
        </a>
    </div>
</div>

<div class="bg-white rounded-xl border border-[#3E2B1F]/10 overflow-hidden shadow-sm">
    <table class="w-full text-sm">
        <thead class="bg-[#F0E2CE]/50 text-[#3E2B1F]">
            <tr>
                <th class="text-left px-6 py-3 font-semibold">Thumbnail</th>
                <th class="text-left px-6 py-3 font-semibold">Judul</th>
                <th class="text-left px-6 py-3 font-semibold">Tanggal Terbit</th>
                <th class="text-right px-6 py-3 font-semibold">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-[#3E2B1F]/10">
            @forelse ($articles as $article)
                <tr class="hover:bg-[#F5F1E8]/60">
                    <td class="px-6 py-3">
                        <div class="w-16 h-12 rounded-md overflow-hidden bg-[#F0E2CE] border border-[#3E2B1F]/10">
                            @if ($article->thumbnail)
                                <img src="{{ asset('storage/'.$article->thumbnail) }}" class="w-full h-full object-cover">
                            @endif
                        </div>
                    </td>
                    <td class="px-6 py-3 font-medium text-[#3E2B1F]">{{ $article->title }}</td>
                    <td class="px-6 py-3 text-[#6B4F3A]">{{ $article->published_at?->format('d M Y') ?? '-' }}</td>
                    <td class="px-6 py-3">
                        <div class="flex justify-end gap-2">
                            <a href="{{ route('admin.articles.edit', $article) }}"
                               class="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2E5E3B]/10 text-[#2E5E3B] hover:bg-[#2E5E3B]/20">Edit</a>
                            <form action="{{ route('admin.articles.destroy', $article) }}" method="POST"
                                  onsubmit="return confirm('Hapus {{ $article->title }}?');">
                                @csrf @method('DELETE')
                                <button class="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="4" class="px-6 py-8 text-center text-[#6B4F3A]/60">Belum ada berita/pamflet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $articles->links() }}</div>
@endsection
