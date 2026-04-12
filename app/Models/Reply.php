<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reply extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'topic_id',
        'user_id',
        'body',
        'is_accepted',
        'status',
        'moderation_reason',
        'ai_score',
    ];

    protected function casts(): array
    {
        return [
            'is_accepted' => 'boolean',
            'likes_count' => 'integer',
            'ai_score' => 'decimal:2',
        ];
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function scopeVisible($query)
    {
        return $query->where('status', 'visible');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}