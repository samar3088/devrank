<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedSearch extends Model
{
    protected $fillable = ['user_id', 'name', 'filters', 'alerts'];

    protected $casts = [
        'filters' => 'array',
        'alerts'  => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Does a newly-posted job match this saved search? Used to fire job alerts.
     */
    public function matchesJob(JobListing $job): bool
    {
        $f = $this->filters ?? [];

        // Each filter may be a single value or an array (multi-select).
        $matches = fn ($filter, $value) => empty($filter)
            || in_array($value, (array) $filter, true);

        if (! empty($f['tag_id']) && ! $job->tags->contains('id', (int) $f['tag_id'])) {
            return false;
        }
        if (! $matches($f['job_type'] ?? null, $job->job_type)) {
            return false;
        }
        if (! $matches($f['work_mode'] ?? null, $job->work_mode)) {
            return false;
        }
        if (! $matches($f['experience'] ?? null, $job->experience_level)) {
            return false;
        }
        if (! empty($f['search'])) {
            $needle = mb_strtolower($f['search']);
            $hay = mb_strtolower($job->title . ' ' . $job->description . ' ' . $job->location);
            if (! str_contains($hay, $needle)) {
                return false;
            }
        }

        return true;
    }
}
