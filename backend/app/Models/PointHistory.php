<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointHistory extends Model
{
    protected $table = 'points_history';

    protected $fillable = [
        'user_id',
        'points',
        'activity_type',
        'description',
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
