@extends('admin.layout')
@section('title', 'Dashboard')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    @php
        $stats = [
            ['label' => 'Kategori', 'count' => \App\Models\Category::count(), 'icon' => 'category', 'route' => 'admin.categories.index'],
            ['label' => 'Tenaga Ahli', 'count' => \App\Models\Expert::count(), 'icon' => 'person', 'route' => 'admin.experts.index'],
            ['label' => 'Mitra / Partner', 'count' => \App\Models\Partner::count(), 'icon' => 'handshake', 'route' => 'admin.partners.index'],
            ['label' => 'Berita / Pamflet', 'count' => \App\Models\Article::count(), 'icon' => 'article', 'route' => 'admin.articles.index'],
        ];
    @endphp

    @foreach ($stats as $s)
        <a href="{{ route($s['route']) }}" class="bg-white rounded-xl border border-[#3E2B1F]/10 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="w-12 h-12 rounded-lg bg-[#2E5E3B]/10 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-[#2E5E3B]">{{ $s['icon'] }}</span>
            </div>
            <p class="text-3xl font-bold text-[#3E2B1F]">{{ $s['count'] }}</p>
            <p class="text-sm text-[#6B4F3A] mt-1">{{ $s['label'] }}</p>
        </a>
    @endforeach
</div>

<div class="mt-10 bg-white rounded-xl border border-[#3E2B1F]/10 p-6">
    <h2 class="font-semibold text-[#3E2B1F] mb-2">Selamat datang di Admin Panel AMDAL.ID</h2>
    <p class="text-sm text-[#6B4F3A]">Gunakan menu di samping untuk mengelola kategori, tenaga ahli/narasumber, mitra kerja sama, serta berita &amp; pamflet yang tampil di halaman utama.</p>
</div>
@endsection
