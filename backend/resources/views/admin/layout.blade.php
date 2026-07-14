<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin') — AMDAL.ID</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-link.active { background-color: rgba(255,255,255,0.12); border-left: 3px solid #F0E2CE; }
    </style>
</head>
<body class="bg-[#F5F1E8] text-[#3E2B1F]">
<div class="flex min-h-screen">

    {{-- Sidebar --}}
    <aside class="w-64 shrink-0 bg-[#2E5E3B] text-white flex flex-col">
        <div class="px-6 py-6 border-b border-white/10">
            <span class="text-xl font-bold tracking-wide">AMDAL<span class="text-[#F0E2CE]">.ID</span></span>
            <p class="text-xs text-white/70 mt-1">Admin Panel</p>
        </div>

        <nav class="flex-1 px-2 py-4 space-y-1">
            @php
                $links = [
                    ['route' => 'admin.dashboard', 'icon' => 'dashboard', 'label' => 'Dashboard'],
                    ['route' => 'admin.categories.index', 'icon' => 'category', 'label' => 'Kategori'],
                    ['route' => 'admin.experts.index', 'icon' => 'person', 'label' => 'Tenaga Ahli'],
                    ['route' => 'admin.partners.index', 'icon' => 'handshake', 'label' => 'Mitra / Partner'],
                    ['route' => 'admin.articles.index', 'icon' => 'article', 'label' => 'Berita / Pamflet'],
                ];
            @endphp

            @foreach ($links as $link)
                @php $base = str_replace('.index', '', $link['route']); @endphp
                <a href="{{ route($link['route']) }}"
                   class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-md text-sm hover:bg-white/10 transition-colors {{ request()->routeIs($base.'*') ? 'active' : '' }}">
                    <span class="material-symbols-outlined text-[20px]">{{ $link['icon'] }}</span>
                    {{ $link['label'] }}
                </a>
            @endforeach
        </nav>

        <div class="px-4 py-4 border-t border-white/10 text-xs text-white/60">
            &copy; {{ date('Y') }} AMDAL.ID
        </div>
    </aside>

    {{-- Main content --}}
    <div class="flex-1 flex flex-col min-w-0">
        <header class="bg-white border-b border-[#3E2B1F]/10 px-8 py-4 flex items-center justify-between shadow-sm">
            <h1 class="text-lg font-semibold text-[#3E2B1F]">@yield('title', 'Dashboard')</h1>
            <div class="flex items-center gap-3">
                <span class="text-sm text-[#6B4F3A]">{{ auth()->user()->name ?? 'Admin' }}</span>
                <div class="w-9 h-9 rounded-full bg-[#2E5E3B] text-white flex items-center justify-center text-sm font-bold">
                    {{ strtoupper(substr(auth()->user()->name ?? 'A', 0, 1)) }}
                </div>
            </div>
        </header>

        <main class="flex-1 p-8">
            @if (session('success'))
                <div class="mb-6 rounded-lg bg-[#2E5E3B]/10 border border-[#2E5E3B]/30 text-[#2E5E3B] px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</div>
</body>
</html>
