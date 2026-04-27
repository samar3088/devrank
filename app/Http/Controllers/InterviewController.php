<?php

namespace App\Http\Controllers;
use App\Models\InterviewReview;
use App\Services\InterviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class InterviewController extends Controller
{
    public function __construct(private InterviewService $interviewService) {}
 
    public function index(Request $request)
    {
        return Inertia::render('InterviewBoard/Index', [
            'reviews'      => $this->interviewService->getReviews($request),
            'topCompanies' => $this->interviewService->getTopCompanies(),
            'filters'      => $request->only(['search', 'outcome', 'company']),
        ]);
    }
 
    public function create()
    {
        return Inertia::render('InterviewBoard/Create');
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name'                => ['required', 'string', 'max:255'],
            'role_applied'                => ['required', 'string', 'max:255'],
            'interview_date'              => ['required', 'date', 'before_or_equal:today'],
            'rounds_detail'               => ['required', 'array', 'min:1', 'max:8'],
            'rounds_detail.*.type'        => ['required', 'string'],
            'rounds_detail.*.difficulty'  => ['required', 'in:easy,medium,hard'],
            'rounds_detail.*.description' => ['nullable', 'string', 'max:500'],
            'outcome'                     => ['required', 'in:selected,rejected,ghosted,pending'],
            'difficulty_rating'           => ['required', 'integer', 'min:1', 'max:5'],
            'experience_rating'           => ['required', 'integer', 'min:1', 'max:5'],
            'tips'                        => ['nullable', 'string', 'max:1000'],
        ]);
 
        $this->interviewService->createReview($request->user(), $validated);
 
        return redirect()->route('interviews.index')
            ->with('success', 'Review posted. Thank you for helping the community!');
    }
 
    public function destroy(Request $request, InterviewReview $review)
    {
        abort_unless($review->user_id === $request->user()->id, 403);
        $this->interviewService->deleteReview($review);
        return back()->with('success', 'Review deleted.');
    }
}