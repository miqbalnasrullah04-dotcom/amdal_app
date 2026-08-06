<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expert;
use App\Models\Document;
use App\Models\Education;
use App\Services\PointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
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
            'password_confirmation' => ['required', 'string', 'same:password'],
            'phone'             => ['nullable', 'string', 'max:20'],
            'institution'       => ['nullable', 'string', 'max:255'],
            'field'             => ['nullable', 'string', 'max:255'],
            'tempat_lahir'      => ['nullable', 'string', 'max:255'],
            'tanggal_lahir'     => ['nullable', 'date'],
            'alamat_kota'       => ['nullable', 'string', 'max:255'],
            'alamat_provinsi'   => ['nullable', 'string', 'max:255'],
            'catatan'           => ['nullable', 'string'],
            'kriteria_list'     => ['nullable', 'json'],
            'foto'              => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'cv'                => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'bukti_kompetensi'  => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // 1. Create User dengan OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(10); // OTP berlaku 10 menit

        $user = User::create([
            'name'            => $request->name,
            'email'           => $request->email,
            'password'        => Hash::make($request->password),
            'role'            => 'user',
            'otp_code'        => $otpCode,
            'otp_expires_at'  => $otpExpiresAt,
        ]);

        // 2. Kirim email OTP
        try {
            Mail::to($user->email)->send(new \App\Mail\OtpVerification($otpCode));
            \Log::info("OTP sent to {$user->email}: {$otpCode}");
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP email: ' . $e->getMessage());
            \Log::info("OTP for {$user->email} (email failed, use this code): {$otpCode}");
            // Lanjutkan proses meski email gagal terkirim
        }

        // Generate token (tapi user belum bisa login sampai email diverifikasi)
        // Token hanya untuk tracking, bukan untuk auth
        $token = $user->createToken('registration_token')->plainTextToken;

        // Award 20 poin untuk registrasi
        $pointService = new PointService();
        $pointService->awardPoints($user, 'register', 'Registrasi akun baru');

        $response = [
            'message' => 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.',
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'otp_sent' => true,
        ];

        return response()->json($response, 201);
    }

    /**
     * Verifikasi email dengan OTP
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        // Debug logging
        \Log::info("OTP Verification Attempt", [
            'email' => $request->email,
            'input_otp' => $request->otp_code,
            'stored_otp' => $user->otp_code,
            'expires_at' => $user->otp_expires_at,
            'current_time' => now(),
           'is_expired' => $user->otp_expires_at ? now()->gt($user->otp_expires_at) : null,
        ]);

        if ($user->otp_code !== $request->otp_code) {
            return response()->json([
                'message' => 'Kode OTP salah.',
            ], 422);
        }

       if ($user->otp_expires_at && now()->gt($user->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP sudah kadaluarsa.'], 422);
        }

        // Verifikasi berhasil
        $user->update([
            'email_verified_at' => now(),
            'otp_code'          => null,
            'otp_expires_at'    => null,
        ]);

        // Cari paket free
        $freePackage = \App\Models\Package::where('price', 0)->first();

        // Buat Expert profile (kosong) untuk user
        Expert::create([
            'user_id'         => $user->id,
            'slug'            => Str::slug($user->name) . '-' . Str::random(5),
            'name'            => $user->name,
            'email'           => $user->email,
            'kriteria'        => 'Tenaga Ahli',
            'profile_status'  => 'draft', // Draft sampai user lengkapi profil & submit
            'package_id'      => $freePackage ? $freePackage->id : null,
        ]);

        // Award 10 poin untuk verifikasi email
        $pointService = new PointService();
        $pointService->awardPoints($user, 'verify_email', 'Verifikasi email berhasil');

        return response()->json([
            'message' => 'Email berhasil diverifikasi! Silakan login.',
            'verified' => true,
        ]);
    }

    /**
     * Kirim ulang OTP
     */
    public function resendOTP(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        // Generate OTP baru
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(10);

        $user->update([
            'otp_code'       => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ]);

        // Kirim email
        try {
            Mail::to($user->email)->send(new \App\Mail\OtpVerification($otpCode));
            \Log::info("OTP resent to {$user->email}: {$otpCode}");

            $response = [
                'message' => 'Kode OTP baru telah dikirim ke email Anda.',
                'otp_sent' => true,
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP email: ' . $e->getMessage());
            \Log::info("OTP for {$user->email} (email failed, use this code): {$otpCode}");

            return response()->json([
                'message' => 'Kode OTP dibuat tetapi email gagal dikirim. Cek log server.',
                'otp_sent' => false,
            ], 500);
        }
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

        // Admin tidak perlu verifikasi email, bisa langsung login
        if ($user->role !== 'admin') {
            // Cek apakah email sudah diverifikasi (hanya untuk user biasa)
            if (!$user->email_verified_at) {
                return response()->json([
                    'message' => 'Email Anda belum diverifikasi. Silakan cek email untuk kode verifikasi.',
                    'email_verified' => false,
                    'email' => $user->email,
                ], 403);
            }
        }

        // User yang sudah verify email BISA LOGIN
        // Status profil (draft, menunggu_verifikasi, ditolak, aktif) akan ditangani di dashboard
        // Mereka tetap bisa login dan melihat status profil mereka

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

    /**
     * Kirim OTP untuk reset password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }

        // Generate 6-digit OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Simpan token ke database
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($otpCode),
                'created_at' => now(),
            ]
        );

        // Kirim email dengan OTP
        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($otpCode, $user->email));
            \Log::info("Password reset OTP sent to {$user->email}: {$otpCode}");

            return response()->json([
                'message' => 'Kode verifikasi telah dikirim ke email Anda.',
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
            \Log::info("Password reset OTP for {$user->email} (email failed): {$otpCode}");

            return response()->json([
                'message' => 'Gagal mengirim email. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Verifikasi OTP reset password
     */
    public function verifyResetToken(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string', 'size:6'],
        ]);

        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'Kode verifikasi tidak valid.'], 422);
        }

        // Cek apakah token expired (15 menit)
        if (now()->diffInMinutes($resetRecord->created_at) > 15) {
            return response()->json(['message' => 'Kode verifikasi sudah kadaluarsa.'], 422);
        }

        // Verifikasi token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['message' => 'Kode verifikasi salah.'], 422);
        }

        return response()->json([
            'message' => 'Kode verifikasi valid.',
            'valid' => true,
        ]);
    }

    /**
     * Reset password dengan OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'Kode verifikasi tidak valid.'], 422);
        }

        // Cek apakah token expired (15 menit)
        if (now()->diffInMinutes($resetRecord->created_at) > 15) {
            return response()->json(['message' => 'Kode verifikasi sudah kadaluarsa.'], 422);
        }

        // Verifikasi token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['message' => 'Kode verifikasi salah.'], 422);
        }

        // Update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus token setelah digunakan
        \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru Anda.',
        ]);
    }
}
