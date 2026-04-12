<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobListing extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jobs_listing';

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'requirements',
        'benefits',
        'job_type',
        'work_mode',
        'location',
        'experience_level',
        'experience_range',
        'salary_min',
        'salary_max',
        'salary_currency',
        'salary_period',
        'status',
        'is_featured',
        'published_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'views_count' => 'integer',
            'applications_count' => 'integer',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'job_tag', 'jobs_listing_id', 'tag_id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'jobs_listing_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('expires_at', '>', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}