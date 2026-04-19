<?php

// ============================================================
// app/Models/QuizOption.php
// ============================================================
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class QuizOption extends Model
{
    protected $fillable = ['question_id', 'option_text', 'is_correct', 'order_column'];
 
    protected function casts(): array
    {
        return ['is_correct' => 'boolean', 'order_column' => 'integer'];
    }
 
    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}