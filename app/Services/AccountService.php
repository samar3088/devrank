<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * DPDP data-subject rights: data access/portability (export) and erasure
 * (delete). Kept in one service so the personal-data surface is defined in a
 * single place — if a new personal field is added, update it here.
 */
class AccountService
{
    /**
     * Assemble everything we hold about a user into a portable structure
     * (right to access / data portability). Read-only.
     */
    public function exportData(User $user): array
    {
        $user->loadMissing('roles');

        return [
            'exported_at' => now()->toIso8601String(),
            'notice'      => 'This file contains the personal data DevRank holds about your account.',
            'account' => [
                'id'                  => $user->id,
                'name'                => $user->name,
                'email'               => $user->email,
                'phone'               => $user->phone,
                'roles'               => $user->getRoleNames(),
                'headline'            => $user->headline,
                'bio'                 => $user->bio,
                'location'            => $user->location,
                'website'             => $user->website,
                'github_url'          => $user->github_url,
                'linkedin_url'        => $user->linkedin_url,
                'resume_path'         => $user->resume_path,
                'experience_level'    => $user->experience_level,
                'years_of_experience' => $user->years_of_experience,
                'open_to_work'        => $user->open_to_work,
                'preferred_job_type'  => $user->preferred_job_type,
                'preferred_location'  => $user->preferred_location,
                'salary_expectation'  => $user->salary_expectation,
                'company_name'        => $user->company_name,
                'company_website'     => $user->company_website,
                'industry'            => $user->industry,
                'total_rank_score'    => $user->total_rank_score,
                'human_score'         => $user->human_score,
                'trust_score'         => $user->trust_score,
                'consented_at'        => optional($user->consented_at)->toIso8601String(),
                'registered_at'       => optional($user->created_at)->toIso8601String(),
            ],
            'forum_topics'       => $user->topics()->get(['id', 'title', 'slug', 'created_at'])->toArray(),
            'forum_replies'      => $user->replies()->get(['id', 'topic_id', 'body', 'is_accepted', 'created_at'])->toArray(),
            'job_applications'   => $user->jobApplications()->get(['id', 'jobs_listing_id', 'status', 'cover_letter', 'created_at'])->toArray(),
            'interests_received' => $user->receivedInterests()->get(['id', 'company_id', 'status', 'message', 'created_at'])->toArray(),
            'interests_sent'     => $user->sentInterests()->get(['id', 'candidate_id', 'status', 'message', 'created_at'])->toArray(),
            'quiz_attempts'      => DB::table('quiz_attempts')->where('user_id', $user->id)
                                        ->get(['id', 'quiz_id', 'status', 'score', 'created_at'])->toArray(),
            'notifications'      => \App\Models\UserNotification::where('user_id', $user->id)
                                        ->get(['id', 'type', 'title', 'body', 'read_at', 'created_at'])->toArray(),
        ];
    }

    /**
     * Erase a user's personal data (right to erasure). Personal fields are
     * scrubbed and the account soft-deleted; authored content (forum answers,
     * quiz history) is kept but re-attributed to an anonymised account so
     * platform integrity — leaderboards, accepted answers — isn't corrupted.
     * The real email is released for re-registration.
     */
    public function eraseAccount(User $user): void
    {
        DB::transaction(function () use ($user) {
            $anonEmail = 'deleted+' . $user->id . '@deleted.local';

            $user->forceFill([
                'name'                => 'Deleted User',
                'email'               => $anonEmail,
                'phone'               => null,
                'avatar'              => null,
                'bio'                 => null,
                'location'            => null,
                'website'             => null,
                'github_url'          => null,
                'linkedin_url'        => null,
                'headline'            => null,
                'resume_path'         => null,
                'preferred_location'  => null,
                'salary_expectation'  => null,
                'company_website'     => null,
                'company_description' => null,
                'company_logo'        => null,
                'open_to_work'        => false,
                'is_active'           => false,
                'remember_token'      => null,
            ])->save();

            // Remove pending outreach addressed to / from this person (their PII in messages).
            $user->receivedInterests()->delete();
            $user->sentInterests()->delete();

            // Soft-delete the account itself.
            $user->delete();
        });
    }
}
