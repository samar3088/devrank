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
        $quiz           = $this->quizService->getQuizForAttempt($slug);
        $existingAttempt = null;
 
        if (auth()->check()) {
            $existingAttempt = $this->quizService->getExistingAttempt(
                auth()->id(),
                $quiz['id']
            );
        }
 
        return Inertia::render('Quiz/Show', [
            'quiz'            => $quiz,
            'existingAttempt' => $existingAttempt ? [
                'id'     => $existingAttempt->id,
                'status' => $existingAttempt->status,
            ] : null,
        ]);
    }
}