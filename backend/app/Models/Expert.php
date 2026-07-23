<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'profile_status', 'reject_reason', 'package_id',
        'slug', 'name', 'field', 'kriteria', 'kriteria_list',
        'location', 'lat', 'lng', 'rating', 'photo', 'cover', 'verified', 'featured',
        'institution', 'active_since', 'email', 'phone', 'tempat_lahir', 'tanggal_lahir',
        'pendidikan', 'catatan', 'cv_path', 'bukti_kompetensi_path', 'keahlian', 'alamat_lengkap',
        'alamat_kota', 'alamat_provinsi', 'lokasi_label', 'sosial',
        'narasumber_riwayat', 'kajian_riwayat',
        // Profil Bio
        'tentang_saya', 'ringkasan_keahlian', 'bidang_utama',
        // Link Akademik
        'scopus_url', 'scopus_metrics', 'google_scholar_url', 'google_scholar_metrics',
        'sinta_url', 'sinta_metrics', 'orcid_url', 'orcid_metrics',
        'researchgate_url', 'researchgate_metrics',
        // Reviewer, Publikasi, Organisasi, Instruktur
        'reviewer_jurnal', 'publikasi', 'organisasi', 'instruktur',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'rating' => 'float',
            'verified' => 'boolean',
            'featured' => 'boolean',
            'kriteria_list' => 'array',
            'keahlian' => 'array',
            'sosial' => 'array',
            'narasumber_riwayat' => 'array',
            'kajian_riwayat' => 'array',
            'tanggal_lahir' => 'date',
            'bidang_utama' => 'array',
            'reviewer_jurnal' => 'array',
            'publikasi' => 'array',
            'organisasi' => 'array',
            'instruktur' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function educations()
    {
        return $this->hasMany(Education::class);
    }

    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public static function kriteriaRouteMap(): array
    {
        return [
            'Narasumber/Pembicara' => '/narasumber',
            'Tenaga Ahli' => '/tenaga-ahli',
            'Instruktur Pengajar' => '/instruktur-pengajar',
            'Peneliti Artikel/Jurnal' => '/peneliti-artikel-jurnal',
        ];
    }
}
