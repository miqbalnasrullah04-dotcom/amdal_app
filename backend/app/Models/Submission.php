<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'user_id', 'judul_pengajuan', 'jenis_pengajuan', 'provinsi', 'kabupaten_kota',
        'nama_pemohon', 'instansi', 'penanggung_jawab',
        'dokumen_pdf', 'dokumen_word', 'dokumen_zip',
        'status', 'catatan_admin', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getDokumenPdfUrlAttribute()
    {
        return $this->dokumen_pdf ? asset('storage/'.$this->dokumen_pdf) : null;
    }

    public function getDokumenWordUrlAttribute()
    {
        return $this->dokumen_word ? asset('storage/'.$this->dokumen_word) : null;
    }

    public function getDokumenZipUrlAttribute()
    {
        return $this->dokumen_zip ? asset('storage/'.$this->dokumen_zip) : null;
    }
}
