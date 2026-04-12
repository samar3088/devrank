<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tag extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'suggested_by',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'usage_count' => 'integer',
        ];
    }

    public function suggestedBy()
    {
        return $this->belongsTo(User::class, 'suggested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function topics()
    {
        return $this->belongsToMany(Topic::class, 'topic_tag');
    }

    public function jobListings()
    {
        return $this->belongsToMany(JobListing::class, 'job_tag', 'tag_id', 'jobs_listing_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}