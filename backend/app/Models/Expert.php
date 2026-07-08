<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expert extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'keahlian', 'kategori', 'lokasi', 'photo', 'cover', 'verified', 'is_featured',
    ];

    protected $casts = [
        'verified'    => 'boolean',
        'is_featured' => 'boolean',
    ];
}
