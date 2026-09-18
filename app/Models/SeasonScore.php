<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeasonScore extends Model
{
    protected $fillable = ['season_id', 'user_id', 'points', 'challenges_completed'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function season()
    {
        return $this->belongsTo(Season::class);
    }
}
