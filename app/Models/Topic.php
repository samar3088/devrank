<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Topic extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'body',
        'status',
        'is_pinned',
        'is_hot',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_hot' => 'boolean',
            'views_count' => 'integer',
            'replies_count' => 'integer',
            'likes_count' => 'integer',
            'last_reply_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'topic_tag');
    }

    public function replies()
    {
        return $this->hasMany(Reply::class);
    }

    public function visibleReplies()
    {
        return $this->hasMany(Reply::class)->where('status', 'visible');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function acceptedReply()
    {
        return $this->hasOne(Reply::class)->where('is_accepted', true);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}