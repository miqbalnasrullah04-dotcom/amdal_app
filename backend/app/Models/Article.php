<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Article extends Model
{
    protected $fillable = ['title', 'slug', 'thumbnail', 'excerpt', 'content', 'published_at'];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::saving(function (Article $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }
        });
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail ? asset('storage/'.$this->thumbnail) : null;
    }
}
