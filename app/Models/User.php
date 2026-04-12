<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'avatar', 'bio',
        'location', 'website', 'github_url', 'linkedin_url',
        'headline', 'resume_path', 'experience_level', 'years_of_experience',
        'open_to_work', 'preferred_job_type', 'preferred_location', 'salary_expectation',
        'company_name', 'company_website', 'company_size', 'industry',
        'company_description', 'company_logo',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'open_to_work' => 'boolean',
            'total_rank_score' => 'integer',
            'human_score' => 'decimal:2',
            'trust_score' => 'integer',
            'limits_reset_at' => 'date',
        ];
    }

    // ── Forum Relations ─────────────────────────────
    public function topics()
    {
        return $this->hasMany(Topic::class);
    }

    public function replies()
    {
        return $this->hasMany(Reply::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    // ── Job Relations ───────────────────────────────
    public function jobListings()
    {
        return $this->hasMany(JobListing::class);
    }

    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    // ── Interest Relations ──────────────────────────
    public function sentInterests()
    {
        return $this->hasMany(InterestRequest::class, 'company_id');
    }

    public function receivedInterests()
    {
        return $this->hasMany(InterestRequest::class, 'candidate_id');
    }

    // ── Profile View Relations ──────────────────────
    public function profileViewsMade()
    {
        return $this->hasMany(ProfileViewLog::class, 'company_id');
    }

    public function profileViewsReceived()
    {
        return $this->hasMany(ProfileViewLog::class, 'candidate_id');
    }

    // ── Tag Relations ───────────────────────────────
    public function suggestedTags()
    {
        return $this->hasMany(Tag::class, 'suggested_by');
    }

    // ── Helper Methods ──────────────────────────────
    public function isAdmin(): bool
    {
        return $this->hasRole(['super_admin', 'sub_admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isCompany(): bool
    {
        return $this->hasRole('company');
    }

    public function isCandidate(): bool
    {
        return $this->hasRole('candidate');
    }

    public function canSendInterest(): bool
    {
        return $this->monthly_outreach_sent < config('devrank.limits.monthly_outreach', 10);
    }

    public function canApplyToJob(): bool
    {
        return $this->monthly_job_applications < config('devrank.limits.monthly_applications', 5);
    }

    public function canPostJob(): bool
    {
        return $this->monthly_job_posts < config('devrank.limits.monthly_job_posts', 5);
    }
}