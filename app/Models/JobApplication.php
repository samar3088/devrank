<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'jobs_listing_id',
        'user_id',
        'cover_letter',
        'resume_path',
        'status',
        'rejection_reason',
        'company_notes',
    ];

    public function jobListing()
    {
        return $this->belongsTo(JobListing::class, 'jobs_listing_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}