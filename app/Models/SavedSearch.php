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

        if (! empty($f['tag_id']) && ! $job->tags->contains('id', (int) $f['tag_id'])) {
            return false;
        }
        if (! empty($f['job_type']) && $f['job_type'] !== $job->job_type) {
            return false;
        }
        if (! empty($f['work_mode']) && $f['work_mode'] !== $job->work_mode) {
            return false;
        }
        if (! empty($f['experience']) && $f['experience'] !== $job->experience_level) {
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
