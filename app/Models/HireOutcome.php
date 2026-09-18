<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A verified hire outcome (#11). Created when a company marks an applicant as
 * hired; becomes `verified` once the candidate confirms. Real offer figures
 * feed the public salary-transparency aggregates only when the candidate has
 * opted in via `salary_shared`.
 */
class HireOutcome extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_application_id',
        'company_id',
        'candidate_id',
        'role_title',
        'experience_level',
        'offered_salary',
        'salary_currency',
        'salary_period',
        'starts_on',
        'status',
        'salary_shared',
        'company_confirmed_at',
        'candidate_confirmed_at',
    ];

    protected $casts = [
        'offered_salary'         => 'integer',
        'salary_shared'          => 'boolean',
        'starts_on'              => 'date',
        'company_confirmed_at'   => 'datetime',
        'candidate_confirmed_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Offered salary normalised to a yearly figure (monthly × 12), or null when
     * no figure was captured. Used for salary-transparency aggregation.
     */
    public function annualisedSalary(): ?int
    {
        if ($this->offered_salary === null) {
            return null;
        }

        return $this->salary_period === 'monthly'
            ? $this->offered_salary * 12
            : $this->offered_salary;
    }
}
