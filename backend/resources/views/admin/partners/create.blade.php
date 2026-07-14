@extends('admin.layout')
@section('title', 'Tambah Mitra')

@section('content')
<div class="max-w-2xl bg-white rounded-xl border border-[#3E2B1F]/10 p-8 shadow-sm">
    <form action="{{ route('admin.partners.store') }}" method="POST" enctype="multipart/form-data" class="space-y-5">
        @csrf
        @include('admin.partners._form', ['partner' => null])
        <div class="flex justify-end gap-3 pt-2">
            <a href="{{ route('admin.partners.index') }}" class="px-5 py-2.5 rounded-full text-sm text-[#6B4F3A] hover:bg-[#F0E2CE]/40">Batal</a>
            <button class="bg-[#2E5E3B] hover:bg-[#254B30] text-white px-6 py-2.5 rounded-full text-sm font-medium">Simpan</button>
        </div>
    </form>
</div>
@endsection
