<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubmissionController extends Controller
{
    // Pastikan user punya paket aktif (verified) sebelum boleh membuat pengajuan
    private function ensureActivePackage(Request $request)
    {
        $hasActiveOrder = Order::where('user_id', $request->user()->id)
            ->where('status', 'verified')
            ->where(function ($q) {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->exists();

        return $hasActiveOrder;
    }

    // Buat pengajuan baru
    public function store(Request $request)
    {
        if (!$this->ensureActivePackage($request)) {
            return response()->json([
                'message' => 'Anda belum memiliki paket aktif untuk membuat pengajuan.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'judul_pengajuan' => ['required', 'string', 'max:255'],
            'jenis_pengajuan' => ['required', 'string', 'max:255'],
            'provinsi' => ['required', 'string', 'max:255'],
            'kabupaten_kota' => ['required', 'string', 'max:255'],
            'nama_pemohon' => ['required', 'string', 'max:255'],
            'instansi' => ['required', 'string', 'max:255'],
            'penanggung_jawab' => ['required', 'string', 'max:255'],
            'dokumen_pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'dokumen_word' => ['nullable', 'file', 'mimes:doc,docx', 'max:10240'],
            'dokumen_zip' => ['nullable', 'file', 'mimes:zip', 'max:20480'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $pdfPath = $request->file('dokumen_pdf')->store('pengajuan/pdf', 'public');
        $wordPath = $request->hasFile('dokumen_word')
            ? $request->file('dokumen_word')->store('pengajuan/word', 'public')
            : null;
        $zipPath = $request->hasFile('dokumen_zip')
            ? $request->file('dokumen_zip')->store('pengajuan/zip', 'public')
            : null;

        $submission = Submission::create([
            'user_id' => $request->user()->id,
            'judul_pengajuan' => $data['judul_pengajuan'],
            'jenis_pengajuan' => $data['jenis_pengajuan'],
            'provinsi' => $data['provinsi'],
            'kabupaten_kota' => $data['kabupaten_kota'],
            'nama_pemohon' => $data['nama_pemohon'],
            'instansi' => $data['instansi'],
            'penanggung_jawab' => $data['penanggung_jawab'],
            'dokumen_pdf' => $pdfPath,
            'dokumen_word' => $wordPath,
            'dokumen_zip' => $zipPath,
            'status' => 'menunggu_review',
        ]);

        return response()->json($submission, 201);
    }

    // Daftar pengajuan milik user yang sedang login
    public function mine(Request $request)
    {
        $submissions = Submission::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($submissions);
    }

    // Detail satu pengajuan (hanya milik sendiri, kecuali admin)
    public function show(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        if ($submission->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        return response()->json($submission);
    }

    // ================== ADMIN ==================

    public function adminIndex(Request $request)
    {
        $query = Submission::with('user:id,name,email')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function updateStatus(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:menunggu_review,diproses,disetujui,ditolak'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $submission->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json($submission);
    }
}
