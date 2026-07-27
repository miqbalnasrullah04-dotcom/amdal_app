<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\Expert;
use App\Services\PointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExperienceController extends Controller
{
    public function index(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        return response()->json($expert->experiences);
    }

    public function store(Request $request)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'posisi' => ['required', 'string', 'max:255'],
            'instansi' => ['required', 'string', 'max:255'],
            'tahun_mulai' => ['nullable', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
            'tahun_selesai' => ['nullable', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
            'deskripsi' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();
        $data['expert_id'] = $expert->id;

        $experience = Experience::create($data);

        // Award 10 poin untuk setiap pengalaman kerja
        $pointService = new PointService();
        $pointService->awardPoints($expert->user_id, 'add_experience', 'Menambahkan pengalaman: ' . $data['posisi'] . ' di ' . $data['instansi']);

        return response()->json($experience, 201);
    }

    public function update(Request $request, $id)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        $experience = Experience::where('expert_id', $expert->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'posisi' => ['required', 'string', 'max:255'],
            'instansi' => ['required', 'string', 'max:255'],
            'tahun_mulai' => ['nullable', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
            'tahun_selesai' => ['nullable', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
            'deskripsi' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $experience->update($validator->validated());

        return response()->json($experience);
    }

    public function destroy(Request $request, $id)
    {
        $expert = Expert::where('user_id', $request->user()->id)->firstOrFail();
        Experience::where('expert_id', $expert->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Pengalaman berhasil dihapus']);
    }
}
