<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        $documents = $expert->documents()->latest()->get();

        // Tambahkan file_url ke setiap dokumen
        $documents = $documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $doc->type,
                'label' => $doc->label,
                'file_path' => $doc->file_path,
                'file_url' => $doc->file_url,
                'created_at' => $doc->created_at,
                'updated_at' => $doc->updated_at,
            ];
        });

        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'type' => ['required', 'in:foto_profil,ktp,ijazah,lainnya'],
            'label' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Foto profil cuma boleh 1 -> hapus yang lama kalau upload baru
        if ($request->type === 'foto_profil') {
            $old = Document::where('expert_id', $expert->id)->where('type', 'foto_profil')->first();
            if ($old) {
                $old->delete();
            }
        }

        $path = $request->file('file')->store('dokumen', 'public');

        $document = Document::create([
            'expert_id' => $expert->id,
            'type' => $request->type,
            'label' => $request->label,
            'file_path' => $path,
        ]);

        // Kalau ini foto profil, sinkronkan juga ke kolom 'photo' di Expert biar tampil di listing publik
        if ($request->type === 'foto_profil') {
            $expert->update(['photo' => $path]);
        } elseif ($request->label === 'CV / Curriculum Vitae') {
            $expert->update(['cv_path' => $path]);
        } elseif ($request->label === 'Bukti Kompetensi') {
            $expert->update(['bukti_kompetensi_path' => $path]);
        }

        return response()->json([
            'id' => $document->id,
            'type' => $document->type,
            'label' => $document->label,
            'file_path' => $document->file_path,
            'file_url' => $document->file_url,
            'message' => 'Dokumen berhasil diunggah',
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        $document = Document::where('expert_id', $expert->id)->findOrFail($id);

        // Hapus file fisik dari storage
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Dokumen berhasil dihapus']);
    }
}
