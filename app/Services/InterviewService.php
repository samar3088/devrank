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
                $q->where('company_name', 'like', "%{$request->search}%")
                  ->orWhere('role_applied',  'like', "%{$request->search}%")
            )
            ->when($request->outcome, fn ($q) => $q->where('outcome', $request->outcome))
            ->when($request->company, fn ($q) => $q->where('company_name', $request->company))
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