<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'educations';

    protected $fillable = ['expert_id', 'jenjang', 'institusi', 'jurusan', 'tahun_lulus'];

    public function expert()
    {
        return $this->belongsTo(Expert::class);
    }
}
