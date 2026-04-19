<?php
// ============================================================
// app/Models/QuizQuestion.php
// ============================================================
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id', 'body', 'type', 'language', 'starter_code',
        'marks', 'order_column', 'explanation',
    ];
 
    protected function casts(): array
    {
        return [
            'marks'        => 'integer',
            'order_column' => 'integer',
        ];
    }
 
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
 
    public function options()
    {
        return $this->hasMany(QuizOption::class, 'question_id')->orderBy('order_column');
    }
 
    public function answers()
    {
        return $this->hasMany(QuizAnswer::class, 'question_id');
    }
 
    public function isMcq(): bool   { return $this->type === 'mcq'; }
    public function isCoding(): bool { return $this->type === 'coding'; }
}