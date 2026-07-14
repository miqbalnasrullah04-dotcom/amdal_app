<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        return response()->json($expert->certificates);
    }

    public function store(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'nama_sertifikat' => ['required', 'string', 'max:255'],
            'penerbit' => ['nullable', 'string', 'max:255'],
            'tahun' => ['nullable', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->safe()->except('file');
        $data['expert_id'] = $expert->id;

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('sertifikat', 'public');
        }

        $certificate = Certificate::create($data);

        return response()->json($certificate, 201);
    }

    public function destroy(Request $request, $id)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        Certificate::where('expert_id', $expert->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Sertifikat berhasil dihapus']);
    }
}
