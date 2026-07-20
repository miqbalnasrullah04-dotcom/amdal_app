<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expert;
use App\Models\Document;
use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Cek status pendaftaran berdasarkan email (tanpa autentikasi).
     * Digunakan oleh halaman "Menunggu Verifikasi" di frontend.
     */
    public function registrationStatus(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }

        $expert = Expert::where('user_id', $user->id)->latest()->first();

        if (!$expert) {
            return response()->json(['message' => 'Data pendaftaran tidak ditemukan.'], 404);
        }

        return match ($expert->profile_status) {
            'aktif' => response()->json([
                'status'  => 'approved',
                'message' => 'Pendaftaran Anda telah disetujui.',
            ]),
            'ditolak' => response()->json([
                'status'  => 'rejected',
                'message' => 'Pendaftaran Anda ditolak.',
                'reason'  => $expert->reject_reason,
            ]),
            default => response()->json([
                'status'  => 'pending',
                'message' => 'Pendaftaran Anda sedang menunggu verifikasi.',
            ]),
        };
    }


    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'              => ['required', 'string', 'max:255'],
            'email'             => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'          => ['required', 'string', 'min:8'],
            'phone'             => ['required', 'string', 'max:20'],
            'institution'       => ['required', 'string', 'max:255'],
            'field'             => ['required', 'string', 'max:255'],
            'tempat_lahir'      => ['nullable', 'string', 'max:255'],
            'tanggal_lahir'     => ['nullable', 'date'],
            'alamat_kota'       => ['nullable', 'string', 'max:255'],
            'alamat_provinsi'   => ['nullable', 'string', 'max:255'],
            'pengalaman'        => ['nullable', 'string'],
            'foto'              => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'cv'                => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'bukti_kompetensi'  => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // 1. Create User
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'user',
        ]);

        // 2. Upload files if any
        $fotoPath  = null;
        $cvPath    = null;
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
            'user_id'               => $user->id,
            'slug'                  => Str::slug($request->name) . '-' . Str::random(5),
            'name'                  => $request->name,
            'email'                 => $request->email,
            'phone'                 => $request->phone,
            'institution'           => $request->institution,
            'field'                 => $request->field,
            'tempat_lahir'          => $request->tempat_lahir,
            'tanggal_lahir'         => $request->tanggal_lahir,
            'alamat_kota'           => $request->alamat_kota,
            'alamat_provinsi'       => $request->alamat_provinsi,
            'pengalaman'            => $request->pengalaman,
            'photo'                 => $fotoPath,
            'cv_path'               => $cvPath,
            'bukti_kompetensi_path' => $buktiPath,
            'kriteria'              => 'Tenaga Ahli',
            'profile_status'        => 'menunggu_verifikasi',
        ]);

        // 4. Simpan riwayat pendidikan jika dikirim sebagai JSON
        if ($request->filled('educations')) {
            $educationsRaw = $request->input('educations');
            $educationsList = is_string($educationsRaw) ? json_decode($educationsRaw, true) : $educationsRaw;

            if (is_array($educationsList)) {
                foreach ($educationsList as $edu) {
                    if (!empty($edu['jenjang']) && !empty($edu['institusi'])) {
                        $expert->educations()->create([
                            'jenjang'     => $edu['jenjang'],
                            'institusi'   => $edu['institusi'],
                            'jurusan'     => $edu['jurusan'] ?? null,
                            'tahun_lulus' => !empty($edu['tahun_lulus']) ? (int) $edu['tahun_lulus'] : null,
                        ]);
                    }
                }
            }
        }

        // 5. Create document records
        if ($fotoPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type'      => 'foto_profil',
                'label'     => 'Pas Foto Formal',
                'file_path' => $fotoPath,
            ]);
        }
        if ($cvPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type'      => 'lainnya',
                'label'     => 'CV / Curriculum Vitae',
                'file_path' => $cvPath,
            ]);
        }
        if ($buktiPath) {
            Document::create([
                'expert_id' => $expert->id,
                'type'      => 'lainnya',
                'label'     => 'Bukti Kompetensi',
                'file_path' => $buktiPath,
            ]);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'   => $user,
            'token'  => $token,
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
