<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['expert_id', 'type', 'label', 'file_path'];

    public function expert()
    {
        return $this->belongsTo(Expert::class);
    }

    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/'.$this->file_path) : null;
    }
}
