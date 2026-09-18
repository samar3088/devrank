<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MockInterview extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'role', 'status', 'ai_graded',
        'transcript', 'overall_score', 'summary', 'completed_at',
    ];

    protected $casts = [
        'transcript'   => 'array',
        'ai_graded'    => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
