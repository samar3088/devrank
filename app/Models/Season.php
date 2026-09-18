<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Season extends Model
{
    protected $fillable = ['name', 'starts_at', 'ends_at', 'is_active'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'is_active' => 'boolean',
    ];

    public function scores()
    {
        return $this->hasMany(SeasonScore::class);
    }

    /** The current active, in-window season (or null). */
    public static function current(): ?self
    {
        return static::where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->latest('starts_at')
            ->first();
    }

    public function daysLeft(): int
    {
        return max(0, (int) ceil(now()->diffInDays($this->ends_at, false)));
    }
}
