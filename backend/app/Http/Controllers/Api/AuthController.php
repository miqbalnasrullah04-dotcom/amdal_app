<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expert;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['required', 'string', 'max:20'],
            'institution' => ['required', 'string', 'max:255'],
            'field' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['nullable', 'string', 'max:255'],
            'tanggal_lahir' => ['nullable', 'date'],
            'pendidikan' => ['nullable', 'string', 'max:255'],
            'pengalaman' => ['nullable', 'string'],
            'foto' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'bukti_kompetensi' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // 1. Create User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        // 2. Upload files if any
        $fotoPath = null;
        $cvPath = null;
        $buktiPath = null;

        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('dokumen', 'public');
        }
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('dokumen', 'public');
        }
        if ($request->hasFile('bukti_kompetensi')) {
            $buktiPath = $request->file('bukti_kompetensi')->store('dokumen', 'public');
        }

        // 3. Create Expert
        $expert = Expert::create([
            'user_id' => $user->id,
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'institution' => $request->institution,
            'field' => $request->field,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'pendidikan' => $request->pendidikan,
            'pengalaman' => $request->pengalaman,
            'photo' => $fotoPath,
            'cv_path' => $cvPath,
            'bukti_kompetensi_path' => $buktiPath,
            'kriteria' => 'Tenaga Ahli',
            'profile_status' => 'menunggu_verifikasi',
        ]);

        // Create documents records for uniformity if files exist
        if ($fotoPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type' => 'foto_profil',
                'label' => 'Pas Foto Formal',
                'file_path' => $fotoPath,
            ]);
        }
        if ($cvPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type' => 'lainnya',
                'label' => 'CV / Curriculum Vitae',
                'file_path' => $cvPath,
            ]);
        }
        if ($buktiPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type' => 'lainnya',
                'label' => 'Bukti Kompetensi',
                'file_path' => $buktiPath,
            ]);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'expert' => $expert,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi salah.'],
            ]);
        }

        // Check if user is a normal user (not admin) and check their verification status
        if ($user->role === 'user') {
            $expert = Expert::where('user_id', $user->id)->first();
            if ($expert && $expert->profile_status === 'menunggu_verifikasi') {
                throw ValidationException::withMessages([
                    'email' => ['Pendaftaran Anda sedang menunggu verifikasi admin. Silakan coba lagi setelah status disetujui atau ditolak.'],
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama tidak sesuai.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
}
