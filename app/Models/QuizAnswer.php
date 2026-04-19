<?php

// ============================================================
// app/Models/QuizAnswer.php
// ============================================================
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class QuizAnswer extends Model
{
    protected $fillable = [
        'attempt_id', 'question_id', 'selected_option_id',
        'answer_text', 'is_correct', 'marks_awarded',
        'ai_score', 'ai_flagged', 'paste_count', 'time_spent_seconds',
    ];
 
    protected function casts(): array
    {
        return [
            'is_correct'        => 'boolean',
            'ai_flagged'        => 'boolean',
            'ai_score'          => 'float',
            'marks_awarded'     => 'integer',
            'paste_count'       => 'integer',
            'time_spent_seconds'=> 'integer',
        ];
    }
 
    public function attempt()
    {
        return $this->belongsTo(QuizAttempt::class, 'attempt_id');
    }
 
    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
 
    public function selectedOption()
    {
        return $this->belongsTo(QuizOption::class, 'selected_option_id');
    }
}