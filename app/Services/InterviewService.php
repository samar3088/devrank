<?php

namespace App\Services;
use App\Models\InterviewReview;
use App\Models\User;
use Illuminate\Http\Request;
 
class InterviewService
{
    public function getReviews(Request $request)
    {
        return InterviewReview::with('user:id,name,total_rank_score')
            ->visible()
            ->when($request->search, fn ($q) =>
                $q->where(fn ($w) =>
                    $w->where('company_name', 'like', "%{$request->search}%")
                      ->orWhere('role_applied', 'like', "%{$request->search}%")
                )
            )
            ->when($request->outcome, fn ($q) => $q->where('outcome', $request->outcome))
            ->when($request->company, fn ($q) => $q->where('company_name', $request->company))
            ->when($request->difficulty, function ($q) use ($request) {
                $map = ['easy' => [1, 2], 'medium' => [3, 3], 'hard' => [4, 5]];
                if (isset($map[$request->difficulty])) {
                    $q->whereBetween('difficulty_rating', $map[$request->difficulty]);
                }
            })
            ->when($request->period, function ($q) use ($request) {
                $since = match ($request->period) {
                    'month'   => now()->startOfMonth(),
                    'quarter' => now()->subMonths(3),
                    'year'    => now()->startOfYear(),
                    default   => null,
                };
                if ($since) {
                    $q->where('created_at', '>=', $since);
                }
            })
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();
    }
 
    public function createReview(User $user, array $data): InterviewReview
    {
        return InterviewReview::create([
            'user_id'           => $user->id,
            'company_name'      => $data['company_name'],
            'role_applied'      => $data['role_applied'],
            'interview_date'    => $data['interview_date'],
            'rounds_count'      => count($data['rounds_detail'] ?? []) ?: 1,
            'rounds_detail'     => $data['rounds_detail'] ?? [],
            'outcome'           => $data['outcome'],
            'difficulty_rating' => $data['difficulty_rating'],
            'experience_rating' => $data['experience_rating'],
            'tips'              => $data['tips'] ?? null,
            'status'            => 'visible',
        ]);
    }
 
    public function deleteReview(InterviewReview $review): void
    {
        $review->delete();
    }

    /**
     * Flag a review. Auto-hides it once it crosses the report threshold.
     */
    public function reportReview(InterviewReview $review): void
    {
        $review->increment('reports_count');

        if ($review->fresh()->reports_count >= 5 && $review->status === 'visible') {
            $review->update(['status' => 'moderated']);
        }
    }
 
    public function getStats(): array
    {
        $total = InterviewReview::visible()->count();
        $selected = InterviewReview::visible()->where('outcome', 'selected')->count();
        $rejected = InterviewReview::visible()->where('outcome', 'rejected')->count();
        $ghosted  = InterviewReview::visible()->where('outcome', 'ghosted')->count();
        $companies = InterviewReview::visible()->distinct('company_name')->count('company_name');
        $avgDifficulty = round((float) InterviewReview::visible()->avg('difficulty_rating'), 1);

        $pct = fn ($n) => $total > 0 ? round($n / $total * 100) : 0;

        return [
            'total'           => $total,
            'companies'       => $companies,
            'avg_difficulty'  => $avgDifficulty,
            'selection_rate'  => $pct($selected),
            'distribution'    => [
                'selected' => $pct($selected),
                'rejected' => $pct($rejected),
                'ghosted'  => $pct($ghosted),
            ],
        ];
    }

    public function getTopCompanies(int $limit = 10): array
    {
        return InterviewReview::visible()
            ->selectRaw('company_name, COUNT(*) as review_count, ROUND(AVG(experience_rating), 1) as avg_experience')
            ->groupBy('company_name')
            ->orderByDesc('review_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}