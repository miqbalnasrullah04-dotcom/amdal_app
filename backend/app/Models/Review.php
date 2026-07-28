<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'expert_id',
        'user_id',
        'reviewer_name',
        'reviewer_email',
        'rating',
        'komentar',
        'balasan',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'rating'     => 'integer',
            'replied_at' => 'datetime',
        ];
    }

    public function expert()
    {
        return $this->belongsTo(Expert::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
