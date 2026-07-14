<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = ['name', 'short', 'logo', 'type', 'order'];

    const TYPES = [
        'mou_university'  => 'MoU Universitas',
        'grant_research'  => 'Grant Research',
        'moa'             => 'MoA System Dynamics Center',
    ];

    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/'.$this->logo) : null;
    }
}
