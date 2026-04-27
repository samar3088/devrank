<?php

// ============================================================
// app/Models/QuizAttempt.php
// ============================================================
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
 
class QuizAttempt extends Model
{
    use SoftDeletes;
 
    protected $fillable = [
        'user_id', 'quiz_id', 'attempt_number', 'status',
        'score', 'percentage', 'passed', 'time_taken_seconds',
        'ai_flagged', 'rank_points_awarded', 'previous_best_score',
        'started_at', 'completed_at',
    ];
 
    protected function casts(): array
    {
        return [
            'passed'              => 'boolean',
            'ai_flagged'          => 'boolean',
            'percentage'          => 'float',
            'score'               => 'integer',
            'rank_points_awarded' => 'integer',
            'previous_best_score' => 'integer',
            'attempt_number'      => 'integer',
            'time_taken_seconds'  => 'integer',
            'started_at'          => 'datetime',
            'completed_at'        => 'datetime',
        ];
    }
 
    public function user()  { return $this->belongsTo(User::class); }
    public function quiz()  { return $this->belongsTo(Quiz::class); }
    public function answers() { return $this->hasMany(QuizAnswer::class, 'attempt_id'); }
 
    public function isCompleted(): bool  { return $this->status === 'completed'; }
    public function isInProgress(): bool { return $this->status === 'in_progress'; }
}