<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionTestCase extends Model
{
    protected $fillable = [
        'question_id', 'input', 'expected_output', 'is_sample', 'weight', 'order_column',
    ];

    protected $casts = [
        'is_sample' => 'boolean',
        'weight'    => 'integer',
    ];

    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
