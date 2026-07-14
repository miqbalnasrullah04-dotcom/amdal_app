<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin — AMDAL.ID</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#3E2B1F] min-h-screen flex items-center justify-center" style="font-family:'Inter',sans-serif;">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-[#2E5E3B]">AMDAL<span class="text-[#6B4F3A]">.ID</span></h1>
            <p class="text-sm text-[#6B4F3A] mt-1">Masuk ke Admin Panel</p>
        </div>

        @if ($errors->any())
            <div class="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {{ $errors->first() }}
            </div>
        @endif

        <form action="{{ route('admin.login.submit') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus
                       class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wide text-[#6B4F3A] mb-1.5">Password</label>
                <input type="password" name="password" required
                       class="w-full rounded-lg border border-[#3E2B1F]/20 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E5E3B]/40 focus:border-[#2E5E3B] outline-none">
            </div>
            <label class="flex items-center gap-2 text-sm text-[#3E2B1F]">
                <input type="checkbox" name="remember" class="rounded border-[#3E2B1F]/30 text-[#2E5E3B]">
                Ingat saya
            </label>
            <button class="w-full bg-[#2E5E3B] hover:bg-[#254B30] text-white py-2.5 rounded-full text-sm font-medium transition-colors">
                Masuk
            </button>
        </form>
    </div>
</body>
</html>
