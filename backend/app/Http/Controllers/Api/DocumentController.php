<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        return response()->json($expert->documents);
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
        }

        return response()->json($document, 201);
    }

    public function destroy(Request $request, $id)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        Document::where('expert_id', $expert->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Dokumen berhasil dihapus']);
    }
}
