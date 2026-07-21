<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\RegistrationApproved;
use App\Mail\RegistrationRejected;
use App\Models\Expert;
use App\Models\Order;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ExpertController extends Controller
{
    // ================== PUBLIK ==================

    public function index(Request $request)
    {
        $query = Expert::where('profile_status', 'aktif');

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('field', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->location.'%');
        }

        if ($request->filled('kriteria')) {
            $query->where('kriteria', 'like', '%'.$request->kriteria.'%');
        }

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        match ($request->input('order', 'latest')) {
            'top_rated' => $query->orderByDesc('rating'),
            'random' => $query->inRandomOrder(),
            default => $query->latest(),
        };

        $experts = $query->get([
            'id', 'slug', 'name', 'field', 'kriteria', 'location',
            'lat', 'lng', 'rating', 'photo', 'cover', 'verified', 'featured',
        ]);

        return response()->json($experts);
    }

    public function show(string $slug)
    {
        $expert = Expert::with(['educations', 'experiences', 'certificates'])
            ->where('slug', $slug)
            ->where('profile_status', 'aktif')
            ->firstOrFail();

        $routeMap = Expert::kriteriaRouteMap();
        $kriteriaList = $expert->kriteria_list ?: [$expert->kriteria];

        // Calculate years of experience
        $yearsActive = $expert->active_since ? now()->year - $expert->active_since : 0;

        $profile = [
            'slug' => $expert->slug,
            'name' => $expert->name,
            'gelar' => $expert->field ? "Ahli {$expert->field}" : '',
            'profesi' => $expert->field ?? 'Tenaga Ahli',
            'institution' => $expert->institution,
            'verified' => $expert->verified,
            'activeSince' => $expert->active_since,
            'photo' => $expert->photo ? (filter_var($expert->photo, FILTER_VALIDATE_URL) ? $expert->photo : asset('storage/' . $expert->photo)) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
            'cover' => $expert->cover ? (filter_var($expert->cover, FILTER_VALIDATE_URL) ? $expert->cover : asset('storage/' . $expert->cover)) : 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1400',
            'email' => $expert->email,
            'ketersediaan' => [
                'status' => 'tersedia',
                'label' => 'Tersedia untuk kerja sama baru'
            ],

            // Bio dan keahlian
            'tentangSaya' => $expert->pengalaman ?? 'Tenaga ahli berpengalaman dengan dedikasi tinggi dalam bidang keahliannya.',
            'ringkasanKeahlian' => "Spesialis {$expert->field} dengan pengalaman lebih dari {$yearsActive} tahun.",
            'bidangUtama' => $expert->keahlian ?? [$expert->field ?? 'Konsultasi Profesional'],
            'keahlian' => $expert->keahlian ?? [$expert->field ?? 'Keahlian Profesional'],
            'spesialisasi' => $expert->keahlian ?? ['Konsultasi', 'Analisis', 'Perencanaan'],
            'kompetensi' => ['Analisis Data', 'Penyusunan Laporan', 'Konsultasi Profesional'],
            'kategoriProfesional' => $kriteriaList,

            // Lokasi dan alamat
            'alamat' => [
                'lengkap' => $expert->alamat_lengkap,
                'kota' => $expert->alamat_kota,
                'provinsi' => $expert->alamat_provinsi,
            ],
            'lokasi' => [
                'label' => $expert->lokasi_label ?: "{$expert->alamat_kota}, {$expert->alamat_provinsi}",
                'lat' => $expert->lat ?: -6.5622,
                'lng' => $expert->lng ?: 106.7297,
            ],

            // Data dari relasi
            'pendidikan' => $expert->educations->map(function ($edu) {
                return [
                    'jenjang' => $edu->jenjang,
                    'institusi' => $edu->institusi,
                    'prodi' => $edu->jurusan,
                    'gelar' => $edu->jenjang,
                    'tahun' => $edu->tahun_lulus,
                ];
            }),
            'pengalamanKerja' => $expert->experiences->map(function ($exp) {
                $startYear = $exp->tahun_mulai;
                $endYear = $exp->tahun_selesai ?: 'Sekarang';
                return [
                    'jabatan' => $exp->posisi,
                    'institusi' => $exp->instansi,
                    'periode' => "{$startYear} — {$endYear}",
                    'deskripsi' => $exp->deskripsi,
                ];
            }),
            'sertifikasi' => $expert->certificates->map(function ($cert) {
                $filePath = $cert->file_path;
                $fileUrl = null;
                $downloadUrl = null;

                if ($filePath) {
                    if (filter_var($filePath, FILTER_VALIDATE_URL)) {
                        $fileUrl = $filePath;
                        $downloadUrl = $filePath;
                    } else {
                        $fileUrl = asset('storage/' . $filePath);
                        $downloadUrl = route('api.file.view', ['path' => $filePath]) . '?download=1';
                    }
                }

                return [
                    'nama' => $cert->nama_sertifikat,
                    'lembaga' => $cert->penerbit,
                    'nomor' => '-',
                    'tahun' => $cert->tahun,
                    'berlakuHingga' => 'Seumur hidup',
                    'dokumen' => $fileUrl ?: '#',
                    'downloadUrl' => $downloadUrl,
                ];
            }),

            // Sosial media dan kriteria
            'sosial' => $expert->sosial ?? [],
            'kriteria' => collect($kriteriaList)->map(fn ($label) => [
                'label' => $label,
                'to' => $routeMap[$label] ?? '/',
            ])->values(),

            // Riwayat kegiatan
            'narasumber' => $expert->narasumber_riwayat ?? [],
            'kajian' => $expert->kajian_riwayat ?? [],

            // Data tambahan untuk template
            'pengalamanProyek' => [], // Akan diisi dari experiences jika ada
            'organisasi' => [],
            'publikasi' => [],
            'reviewerJurnal' => [],
            'instruktur' => [],
            'profilAkademik' => null,
            'portofolio' => [
                'cv' => $expert->cv_path,
                'sertifikat' => $expert->certificates->pluck('file_path')->filter()->toArray(),
                'dokumentasi' => [],
                'dokumenProyek' => [],
                'video' => null,
            ],
        ];

        return response()->json($profile);
    }

    // ================== USER (dashboard & lengkapi profil) ==================

    public function myProfile(Request $request)
    {
        $user = $request->user();

        $expert = Expert::with(['educations', 'experiences', 'certificates', 'documents', 'package'])
            ->where('user_id', $user->id)
            ->first();

        if (!$expert) {
            $expert = Expert::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'slug' => Str::slug($user->name).'-'.Str::random(5),
                'profile_status' => 'draft',
            ]);
            $expert->load(['educations', 'experiences', 'certificates', 'documents', 'package']);
        }

        return response()->json($expert);
    }

    public function saveProfile(Request $request)
    {
        $user = $request->user();
        $expert = Expert::where('user_id', $user->id)->firstOrFail();

        // Jika hanya update package_id (dari halaman PilihPaket)
        if ($request->has('package_id') && count($request->all()) === 1) {
            $expert->update(['package_id' => $request->package_id]);
            return response()->json($expert);
        }

        $validator = Validator::make($request->all(), [
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            'institution'     => ['nullable', 'string', 'max:255'],
            'field'           => ['nullable', 'string', 'max:255'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'kriteria'        => ['nullable', 'string', 'max:255'],
            'alamat_lengkap'  => ['nullable', 'string'],
            'alamat_kota'     => ['nullable', 'string', 'max:255'],
            'alamat_provinsi' => ['nullable', 'string', 'max:255'],
            'tempat_lahir'    => ['nullable', 'string', 'max:255'],
            'tanggal_lahir'   => ['nullable', 'date'],
            'pengalaman'      => ['nullable', 'string'],
            'package_id'      => ['nullable', 'exists:packages,id'],
            'photo'           => ['nullable', 'image', 'max:2048'], // 2MB max
            'cover'           => ['nullable', 'image', 'max:5120'], // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($expert->photo && \Storage::disk('public')->exists($expert->photo)) {
                \Storage::disk('public')->delete($expert->photo);
            }

            $photoPath = $request->file('photo')->store('experts/photos', 'public');
            $data['photo'] = $photoPath;
        }

        // Handle cover upload
        if ($request->hasFile('cover')) {
            // Delete old cover if exists
            if ($expert->cover && \Storage::disk('public')->exists($expert->cover)) {
                \Storage::disk('public')->delete($expert->cover);
            }

            $coverPath = $request->file('cover')->store('experts/covers', 'public');
            $data['cover'] = $coverPath;
        }

        $expert->update($data);

        if ($expert->profile_status === 'ditolak') {
            $expert->update(['profile_status' => 'draft', 'reject_reason' => null]);
        }

        return response()->json($expert);
    }

    public function submitForVerification(Request $request)
    {
        $user = $request->user();
        $expert = Expert::where('user_id', $user->id)->firstOrFail();

        $missing = $this->checkCompleteness($expert);
        if (!empty($missing)) {
            return response()->json([
                'message' => 'Profil belum lengkap.',
                'missing' => $missing,
            ], 422);
        }

        if (!$expert->package_id) {
            return response()->json(['message' => 'Silakan pilih paket terlebih dahulu.'], 422);
        }

        $package = Package::find($expert->package_id);
        if ($package && $package->price > 0) {
            $order = Order::where('user_id', $user->id)
                ->where('package_id', $package->id)
                ->latest()
                ->first();

            if (!$order || $order->status !== 'menunggu_verifikasi') {
                return response()->json(['message' => 'Silakan selesaikan pembayaran terlebih dahulu.'], 422);
            }
        }

        $expert->update(['profile_status' => 'menunggu_verifikasi']);

        return response()->json($expert);
    }

    private function checkCompleteness(Expert $expert): array
    {
        $missing = [];
        if (!$expert->name) $missing[] = 'Nama';
        if (!$expert->institution) $missing[] = 'Instansi';
        if (!$expert->field) $missing[] = 'Bidang Keahlian';
        if (!$expert->alamat_kota) $missing[] = 'Kota';
        if ($expert->educations()->count() === 0) $missing[] = 'Pendidikan (minimal 1)';

        return $missing;
    }

    // ================== ADMIN CRUD ==================

    public function adminIndex(Request $request)
    {
        $query = Expert::with(['user:id,name,email', 'educations', 'experiences', 'certificates', 'documents'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('profile_status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'field' => ['nullable', 'string', 'max:255'],
            'kriteria' => ['nullable', 'string', 'max:255'],
            'alamat_kota' => ['nullable', 'string', 'max:255'],
            'alamat_provinsi' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'string'],
            'verified' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['slug'] = Str::slug($request->name).'-'.Str::random(5);
        $data['profile_status'] = 'aktif';

        $expert = Expert::create($data);

        return response()->json($expert, 201);
    }

    public function update(Request $request, $id)
    {
        $expert = Expert::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'field' => ['nullable', 'string', 'max:255'],
            'kriteria' => ['nullable', 'string', 'max:255'],
            'alamat_kota' => ['nullable', 'string', 'max:255'],
            'alamat_provinsi' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'string'],
            'verified' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
        }

        $expert->update($validator->validated());

        return response()->json($expert);
    }

    public function destroy($id)
    {
        Expert::findOrFail($id)->delete();

        return response()->json(['message' => 'Tenaga ahli berhasil dihapus']);
    }

    // ================== ADMIN VERIFIKASI PROFIL ==================

    public function verifyProfile(Request $request, $id)
    {
        $expert = Expert::with('user')->findOrFail($id);

        $missing = $this->checkCompleteness($expert);
        if (!empty($missing)) {
            return response()->json(['message' => 'Profil belum lengkap, tidak bisa disetujui.', 'missing' => $missing], 422);
        }

        $expert->update(['profile_status' => 'aktif', 'verified' => true, 'reject_reason' => null]);

        // Kirim email notifikasi ke user
        $recipientEmail = $expert->user?->email ?? $expert->email;
        if ($recipientEmail) {
            $loginUrl = rtrim(config('app.frontend_url', config('app.url')), '/') . '/sign-in';
            try {
                Mail::to($recipientEmail)->send(new RegistrationApproved($expert, $loginUrl));
            } catch (\Throwable $e) {
                // Gagal kirim email tidak boleh membatalkan verifikasi
                \Log::warning('Gagal kirim email RegistrationApproved: ' . $e->getMessage());
            }
        }

        return response()->json($expert);
    }

    public function rejectProfile(Request $request, $id)
    {
        $expert = Expert::with('user')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reject_reason' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $reason = $request->reject_reason ?? '';

        $expert->update([
            'profile_status' => 'ditolak',
            'reject_reason'  => $reason,
        ]);

        // Kirim email notifikasi ke user
        $recipientEmail = $expert->user?->email ?? $expert->email;
        if ($recipientEmail) {
            $registerUrl = rtrim(config('app.frontend_url', config('app.url')), '/') . '/daftar';
            try {
                Mail::to($recipientEmail)->send(new RegistrationRejected($expert, $reason, $registerUrl));
            } catch (\Throwable $e) {
                \Log::warning('Gagal kirim email RegistrationRejected: ' . $e->getMessage());
            }
        }

        return response()->json($expert);
    }

    // ================== ADMIN NONAKTIFKAN / AKTIFKAN AKUN ==================

    public function deactivateProfile(Request $request, $id)
    {
        $expert = Expert::findOrFail($id);

        // Toggle: jika sudah nonaktif, aktifkan kembali; jika aktif, nonaktifkan
        if ($expert->profile_status === 'nonaktif') {
            $expert->update(['profile_status' => 'aktif']);
        } else {
            $expert->update(['profile_status' => 'nonaktif']);
        }

        return response()->json($expert);
    }

    // ================== ADMIN DASHBOARD STATS ==================

    public function dashboardStats()
    {
        $totalPendaftar = Expert::count();
        $totalTenagaAhli = Expert::where('profile_status', 'aktif')->count();
        $pendingVerifikasi = Expert::where('profile_status', 'menunggu_verifikasi')->count();

        // Pengguna free: expert yang punya paket gratis (price=0) atau tanpa paket
        $freePackageIds = Package::where('price', 0)->pluck('id')->toArray();
        $penggunaFree = Expert::where(function ($q) use ($freePackageIds) {
            $q->whereNull('package_id')
              ->orWhereIn('package_id', $freePackageIds);
        })->count();

        // Pengguna premium: expert yang punya order verified (paket berbayar)
        $penggunaPremium = Order::where('status', 'verified')
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'total_pendaftar' => $totalPendaftar,
            'total_tenaga_ahli' => $totalTenagaAhli,
            'pending_verifikasi' => $pendingVerifikasi,
            'pengguna_free' => $penggunaFree,
            'pengguna_premium' => $penggunaPremium,
        ]);
    }
}
