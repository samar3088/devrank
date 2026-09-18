<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * DPDP data-subject rights: data access/portability (export) and erasure
 * (delete). Kept in one service so the personal-data surface is defined in a
 * single place — if a new personal field is added, update it here (both the
 * export relations and the erasure scrub).
 */
class AccountService
{
    /**
     * The account scalar fields we hold about a user (right to access).
     */
    private function accountScalars(User $user): array
    {
        $user->loadMissing('roles');

        return [
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
            'github_username'     => $user->github_username,
            'github_verified_at'  => optional($user->github_verified_at)->toIso8601String(),
            'github_stats'        => $user->github_stats,
            'linkedin_url'        => $user->linkedin_url,
            'resume_path'         => $user->resume_path,
            'experience_level'    => $user->experience_level,
            'years_of_experience' => $user->years_of_experience,
            'open_to_work'        => $user->open_to_work,
            'anonymous'           => $user->anonymous,
            'preferred_job_type'  => $user->preferred_job_type,
            'preferred_location'  => $user->preferred_location,
            'salary_expectation'  => $user->salary_expectation,
            'company_name'        => $user->company_name,
            'company_website'     => $user->company_website,
            'company_size'        => $user->company_size,
            'industry'            => $user->industry,
            'total_rank_score'    => $user->total_rank_score,
            'human_score'         => $user->human_score,
            'trust_score'         => $user->trust_score,
            'consented_at'        => optional($user->consented_at)->toIso8601String(),
            'registered_at'       => optional($user->created_at)->toIso8601String(),
        ];
    }

    /**
     * The personal-data relations we hold, each as a query builder (so the same
     * definition powers both the in-memory export and the streamed download).
     * This is the single source of truth for the export relation surface.
     *
     * @return array<string, \Illuminate\Contracts\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder>
     */
    private function exportRelations(User $user): array
    {
        return [
            'forum_topics'       => $user->topics()->select('id', 'title', 'slug', 'created_at'),
            'forum_replies'      => $user->replies()->select('id', 'topic_id', 'body', 'is_accepted', 'created_at'),
            'forum_likes'        => $user->likes()->select('id', 'likeable_type', 'likeable_id', 'created_at'),
            'job_applications'   => $user->jobApplications()->select('id', 'jobs_listing_id', 'status', 'cover_letter', 'created_at'),
            'interests_received' => $user->receivedInterests()->select('id', 'company_id', 'status', 'message', 'created_at'),
            'interests_sent'     => $user->sentInterests()->select('id', 'candidate_id', 'status', 'message', 'created_at'),
            'quiz_attempts'      => DB::table('quiz_attempts')->where('user_id', $user->id)
                                       ->select('id', 'quiz_id', 'status', 'score', 'created_at'),
            'hire_outcomes'      => \App\Models\HireOutcome::where('candidate_id', $user->id)
                                       ->select('id', 'role_title', 'status', 'offered_salary', 'salary_currency', 'salary_period', 'salary_shared', 'starts_on', 'created_at'),
            'mock_interviews'    => \App\Models\MockInterview::where('user_id', $user->id)
                                       ->select('id', 'company_name', 'role', 'status', 'ai_graded', 'overall_score', 'transcript', 'summary', 'created_at'),
            'saved_searches'     => $user->savedSearches()->select('id', 'name', 'filters', 'alerts', 'created_at'),
            'interview_reviews'  => \App\Models\InterviewReview::where('user_id', $user->id)
                                       ->select('id', 'company_name', 'role_applied', 'interview_date', 'outcome', 'rounds_detail', 'tips', 'created_at'),
            'profile_view_logs'  => \App\Models\ProfileViewLog::where('candidate_id', $user->id)
                                       ->select('id', 'company_id', 'view_type', 'ip_address', 'created_at'),
            'credential_tokens'  => DB::table('credential_tokens')->where('user_id', $user->id)
                                       ->select('id', 'token', 'revoked_at', 'created_at'),
            'notifications'      => \App\Models\UserNotification::where('user_id', $user->id)
                                       ->select('id', 'type', 'title', 'body', 'read_at', 'created_at'),
        ];
    }

    /**
     * Assemble everything we hold about a user into a portable array
     * (right to access / data portability). In-memory — prefer streamExport()
     * for the actual download so memory stays bounded on prolific accounts.
     */
    public function exportData(User $user): array
    {
        $out = [
            'exported_at' => now()->toIso8601String(),
            'notice'      => 'This file contains the personal data DevRank holds about your account.',
            'account'     => $this->accountScalars($user),
        ];

        foreach ($this->exportRelations($user) as $key => $query) {
            $out[$key] = $query->get()->map(fn ($r) => (array) $r)->all();
        }

        return $out;
    }

    /**
     * Right to access / portability — stream the export as a JSON file, writing
     * each relation with a DB cursor so memory stays bounded regardless of how
     * much content the user has authored (chunked export).
     */
    public function streamExport(User $user): StreamedResponse
    {
        $filename = 'devrank-data-' . $user->id . '-' . now()->format('Ymd') . '.json';

        return response()->streamDownload(function () use ($user) {
            $out = fopen('php://output', 'w');

            fwrite($out, '{');
            fwrite($out, '"exported_at":' . json_encode(now()->toIso8601String()));
            fwrite($out, ',"notice":' . json_encode('This file contains the personal data DevRank holds about your account.'));
            fwrite($out, ',"account":' . json_encode($this->accountScalars($user), JSON_UNESCAPED_SLASHES));

            foreach ($this->exportRelations($user) as $key => $query) {
                fwrite($out, ',' . json_encode($key) . ':[');
                $first = true;
                foreach ($query->cursor() as $row) {
                    fwrite($out, ($first ? '' : ',') . json_encode((array) $row, JSON_UNESCAPED_SLASHES));
                    $first = false;
                }
                fwrite($out, ']');
                flush();
            }

            fwrite($out, '}');
            fclose($out);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Erase a user's personal data (right to erasure). Personal fields are
     * scrubbed and the account soft-deleted; authored content (forum answers,
     * quiz history) is kept but re-attributed to an anonymised account so
     * platform integrity — leaderboards, accepted answers — isn't corrupted.
     * The real email is released for re-registration.
     *
     * NOTE: erasure soft-deletes the user, so FK `cascadeOnDelete` never fires —
     * personal data in child tables must be scrubbed/deleted explicitly here.
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
                'github_id'           => null,
                'github_username'     => null,
                'github_verified_at'  => null,
                'github_stats'        => null,
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

            // Scrub the candidate's compensation from any hire outcomes and pull
            // them out of the public salary-transparency aggregates.
            \App\Models\HireOutcome::where('candidate_id', $user->id)
                ->update(['offered_salary' => null, 'salary_shared' => false]);

            // Child tables carrying personal data — soft-delete means the FK
            // cascade won't fire, so scrub them explicitly.
            \App\Models\MockInterview::where('user_id', $user->id)->delete();   // transcripts = their own words
            $user->savedSearches()->delete();                                   // saved job filters
            DB::table('credential_tokens')->where('user_id', $user->id)->delete();
            \App\Models\ProfileViewLog::where('candidate_id', $user->id)->update(['ip_address' => null]);

            // Soft-delete the account itself.
            $user->delete();
        });
    }
}
