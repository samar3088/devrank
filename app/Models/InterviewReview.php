<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
 
class InterviewReview extends Model
{
    use SoftDeletes;
 
    protected $fillable = [
        'user_id', 'company_name', 'role_applied', 'interview_date',
        'rounds_count', 'rounds_detail', 'outcome',
        'difficulty_rating', 'experience_rating', 'tips', 'status', 'likes_count',
    ];
 
    protected function casts(): array
    {
        return [
            'rounds_detail'     => 'array',
            'interview_date'    => 'date',
            'difficulty_rating' => 'integer',
            'experience_rating' => 'integer',
            'rounds_count'      => 'integer',
            'likes_count'       => 'integer',
        ];
    }
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function scopeVisible($query)
    {
        return $query->where('status', 'visible');
    }
}