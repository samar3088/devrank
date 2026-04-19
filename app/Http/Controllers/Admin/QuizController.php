<?php

// ============================================================
// app/Http/Controllers/Admin/QuizController.php
// Super admin: CRUD quizzes + questions
// ============================================================
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\Tag;
use App\Services\QuizService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
 
class QuizController extends Controller
{
    public function __construct(private QuizService $quizService) {}
 
    // ── Quiz CRUD ────────────────────────────────────────────────
    public function index()
    {
        $quizzes = Quiz::with(['tag:id,name', 'creator:id,name'])
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->paginate(20);
 
        return Inertia::render('Admin/Quiz/Index', [
            'quizzes' => $quizzes,
        ]);
    }
 
    public function create()
    {
        return Inertia::render('Admin/Quiz/Create', [
            'tags' => Tag::where('status', 'approved')->orderBy('name')->get(['id', 'name']),
        ]);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'               => ['required', 'string', 'max:255'],
            'tag_id'              => ['nullable', 'exists:tags,id'],
            'description'         => ['nullable', 'string'],
            'difficulty'          => ['required', 'in:easy,medium,hard'],
            'time_limit_minutes'  => ['required', 'integer', 'min:5', 'max:180'],
            'passing_score'       => ['required', 'integer', 'min:1', 'max:100'],
            'status'              => ['required', 'in:draft,published'],
        ]);
 
        $quiz = Quiz::create([
            ...$validated,
            'slug'       => Str::slug($validated['title']),
            'created_by' => auth()->id(),
        ]);
 
        return redirect()->route('admin.quiz.questions', $quiz->id)
            ->with('success', 'Quiz created. Now add questions.');
    }
 
    public function edit(Quiz $quiz)
    {
        return Inertia::render('Admin/Quiz/Edit', [
            'quiz' => $quiz,
            'tags' => Tag::where('status', 'approved')->orderBy('name')->get(['id', 'name']),
        ]);
    }
 
    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'title'              => ['required', 'string', 'max:255'],
            'tag_id'             => ['nullable', 'exists:tags,id'],
            'description'        => ['nullable', 'string'],
            'difficulty'         => ['required', 'in:easy,medium,hard'],
            'time_limit_minutes' => ['required', 'integer', 'min:5', 'max:180'],
            'passing_score'      => ['required', 'integer', 'min:1', 'max:100'],
            'status'             => ['required', 'in:draft,published'],
        ]);
 
        $quiz->update($validated);
 
        return back()->with('success', 'Quiz updated.');
    }
 
    public function destroy(Quiz $quiz)
    {
        $quiz->delete();
        return redirect()->route('admin.quiz.index')->with('success', 'Quiz deleted.');
    }
 
    // ── Questions management ─────────────────────────────────────
    public function questions(Quiz $quiz)
    {
        $quiz->load(['questions.options']);
 
        return Inertia::render('Admin/Quiz/Questions', [
            'quiz' => $quiz,
        ]);
    }
 
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'body'         => ['required', 'string'],
            'type'         => ['required', 'in:mcq,coding'],
            'language'     => ['nullable', 'string', 'in:javascript,php,python,java,cpp'],
            'starter_code' => ['nullable', 'string'],
            'marks'        => ['required', 'integer', 'min:1', 'max:100'],
            'explanation'  => ['nullable', 'string'],
            'options'      => ['required_if:type,mcq', 'array', 'min:2', 'max:4'],
            'options.*.option_text' => ['required', 'string'],
            'options.*.is_correct'  => ['required', 'boolean'],
        ]);
 
        // Exactly one correct option for MCQ
        if ($validated['type'] === 'mcq') {
            $correctCount = collect($validated['options'])->where('is_correct', true)->count();
            if ($correctCount !== 1) {
                return back()->withErrors(['options' => 'Exactly one option must be marked as correct.']);
            }
        }
 
        $question = $quiz->questions()->create([
            'body'         => $validated['body'],
            'type'         => $validated['type'],
            'language'     => $validated['language'] ?? null,
            'starter_code' => $validated['starter_code'] ?? null,
            'marks'        => $validated['marks'],
            'explanation'  => $validated['explanation'] ?? null,
            'order_column' => $quiz->questions()->max('order_column') + 1,
        ]);
 
        if ($validated['type'] === 'mcq') {
            foreach ($validated['options'] as $i => $opt) {
                QuizOption::create([
                    'question_id'  => $question->id,
                    'option_text'  => $opt['option_text'],
                    'is_correct'   => $opt['is_correct'],
                    'order_column' => $i,
                ]);
            }
        }
 
        // Recalculate total marks
        $quiz->recalculateTotalMarks();
 
        return back()->with('success', 'Question added.');
    }
 
    public function destroyQuestion(Quiz $quiz, QuizQuestion $question)
    {
        abort_unless($question->quiz_id === $quiz->id, 422);
        $question->delete();
        $quiz->recalculateTotalMarks();
 
        return back()->with('success', 'Question deleted.');
    }
 
    // ── Attempts: review AI-flagged ──────────────────────────────
    public function attempts(Quiz $quiz)
    {
        $attempts = QuizAttempt::with(['user:id,name,total_rank_score'])
            ->where('quiz_id', $quiz->id)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->paginate(25);
 
        $stats = $this->quizService->getQuizStats($quiz);
 
        return Inertia::render('Admin/Quiz/Attempts', [
            'quiz'     => $quiz,
            'attempts' => $attempts,
            'stats'    => $stats,
        ]);
    }
}