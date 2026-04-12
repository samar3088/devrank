<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InterestRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'candidate_id',
        'message',
        'role_title',
        'salary_range',
        'location',
        'status',
        'responded_at',
        'profile_viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'profile_viewed_at' => 'datetime',
        ];
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function profileViewLog()
    {
        return $this->hasOne(ProfileViewLog::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}