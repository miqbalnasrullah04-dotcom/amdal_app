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
        'institution', 'active_since', 'email', 'keahlian', 'alamat_lengkap',
        'alamat_kota', 'alamat_provinsi', 'lokasi_label', 'sosial',
        'narasumber_riwayat', 'kajian_riwayat',
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
