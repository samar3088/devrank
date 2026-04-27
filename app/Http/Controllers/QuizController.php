<?php
// ============================================================
// app/Http/Controllers/QuizController.php
// Public quiz listing + detail
// ============================================================
namespace App\Http\Controllers;
 
use App\Services\QuizService;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class QuizController extends Controller
{
    public function __construct(private QuizService $quizService) {}
 
    public function index(Request $request)
    {
        $quizzes = $this->quizService->getPublishedQuizzes(
            $request->input('tag'),
            $request->input('difficulty')
        );
 
        return Inertia::render('Quiz/Index', [
            'quizzes' => $quizzes,
            'filters' => [
                'tag'        => $request->input('tag', ''),
                'difficulty' => $request->input('difficulty', ''),
            ],
        ]);
    }
 
    public function show(string $slug)
    {
        $quiz = Quiz::published()
            ->with(['tag:id,name,slug', 'questions:id,quiz_id'])
            ->where('slug', $slug)
            ->firstOrFail();
    
        // Build attempt summary for authenticated candidates
        $summary = null;
        if (auth()->check() && auth()->user()->hasRole('candidate')) {
            $summary = $this->quizService->getAttemptsSummary(auth()->id(), $quiz);
        }
    
        // Prepare quiz data for the view (without correct answers)
        $quizData = [
            'id'                 => $quiz->id,
            'title'              => $quiz->title,
            'description'        => $quiz->description,
            'difficulty'         => $quiz->difficulty,
            'time_limit_minutes' => $quiz->time_limit_minutes,
            'passing_score'      => $quiz->passing_score,
            'total_marks'        => $quiz->total_marks,
            'max_attempts'       => $quiz->max_attempts,
            'tag'                => $quiz->tag,
            'questions'          => $quiz->questions,  // just IDs for count
        ];
    
        return Inertia::render('Quiz/Show', [
            'quiz'    => $quizData,
            'summary' => $summary,
        ]);
    }
}