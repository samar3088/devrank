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
        $quizzes = Quiz::with(['tag:id,name,slug', 'creator:id,name'])
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->paginate(20);
    
        // Attach per-quiz pass_rate and ai_flag_count
        $quizzes->getCollection()->transform(function ($quiz) {
            // Fresh builder per aggregate — chaining where() on one shared
            // instance mutates it and corrupts later counts.
            $base = fn () => \App\Models\QuizAttempt::where('quiz_id', $quiz->id)
                ->where('status', 'completed');

            $total     = $base()->count();
            $passed    = $base()->where('passed', true)->count();
            $aiFlagged = $base()->where('ai_flagged', true)->count();

            $quiz->pass_rate      = $total > 0 ? round(($passed / $total) * 100) : 0;
            $quiz->ai_flag_count  = $aiFlagged;

            return $quiz;
        });

        // Global stats across all quizzes (fresh builder per aggregate)
        $allCompleted  = fn () => \App\Models\QuizAttempt::where('status', 'completed');
        $totalAttempts = $allCompleted()->count();
        $totalPassed   = $allCompleted()->where('passed', true)->count();

        $stats = [
            'total_attempts'   => $totalAttempts,
            'total_passed'     => $totalPassed,
            'total_ai_flagged' => $allCompleted()->where('ai_flagged', true)->count(),
            'avg_pass_rate'    => $totalAttempts > 0
                ? round(($totalPassed / $totalAttempts) * 100)
                : 0,
        ];
    
        return Inertia::render('Admin/Quiz/Index', [
            'quizzes' => $quizzes,
            'stats'   => $stats,
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
            'title'              => ['required', 'string', 'max:255'],
            'tag_id'             => ['nullable', 'exists:tags,id'],
            'description'        => ['nullable', 'string'],
            'difficulty'         => ['required', 'in:easy,medium,hard'],
            'time_limit_minutes' => ['required', 'integer', 'min:5', 'max:180'],
            'passing_score'      => ['required', 'integer', 'min:1', 'max:100'],
            'max_attempts'       => ['required', 'integer', 'min:0', 'max:5'],  // ← ADD
            'status'             => ['required', 'in:draft,published'],
            'is_challenge'         => ['boolean'],
            'challenge_starts_at'  => ['nullable', 'date'],
            'challenge_ends_at'    => ['nullable', 'date', 'after:challenge_starts_at'],
        ]);

        $quiz = Quiz::create([
            ...$validated,
            'slug'       => Str::slug($validated['title']) . '-' . Str::lower(Str::random(4)),
            'created_by' => auth()->id(),
            // A weekly challenge joins the current active season.
            'season_id'  => ! empty($validated['is_challenge']) ? optional(\App\Models\Season::current())->id : null,
        ]);

        return redirect()->route('admin.quiz.questions', $quiz->id)
            ->with('success', 'Quiz created. Now add questions.');
    }
 
    public function edit(Quiz $quiz)
    {
        // Create.jsx is the combined create/edit form (isEdit = !!quiz).
        return Inertia::render('Admin/Quiz/Create', [
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
            'max_attempts'       => ['required', 'integer', 'min:0', 'max:5'],  // ← ADD
            'status'             => ['required', 'in:draft,published'],
            'is_challenge'         => ['boolean'],
            'challenge_starts_at'  => ['nullable', 'date'],
            'challenge_ends_at'    => ['nullable', 'date', 'after:challenge_starts_at'],
        ]);

        // Keep the season link in sync with the challenge flag.
        if (! empty($validated['is_challenge']) && ! $quiz->season_id) {
            $validated['season_id'] = optional(\App\Models\Season::current())->id;
        }

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
        $quiz->load(['questions.options', 'questions.testCases']);

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
            'test_cases'   => ['array', 'max:30'],
            'test_cases.*.input'           => ['nullable', 'string'],
            'test_cases.*.expected_output' => ['required', 'string'],
            'test_cases.*.is_sample'       => ['boolean'],
            'test_cases.*.weight'          => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $codingEnabled = config('devrank.judge0.enabled') || config('devrank.ai.enabled', false);

        // Coding questions need a grader (Judge0 or AI).
        if ($validated['type'] === 'coding' && ! $codingEnabled) {
            return back()->withErrors(['type' => 'Coding questions need a grader — enable Judge0 (JUDGE0_URL) or AI grading. Add MCQ questions only for now.']);
        }

        // With Judge0, a coding question needs at least one test case to be gradable.
        if ($validated['type'] === 'coding' && config('devrank.judge0.enabled') && empty($validated['test_cases'])) {
            return back()->withErrors(['test_cases' => 'Add at least one test case so the submission can be graded objectively.']);
        }

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

        if ($validated['type'] === 'coding') {
            foreach (array_values($validated['test_cases'] ?? []) as $i => $tc) {
                \App\Models\QuestionTestCase::create([
                    'question_id'     => $question->id,
                    'input'           => $tc['input'] ?? null,
                    'expected_output' => $tc['expected_output'],
                    'is_sample'       => $tc['is_sample'] ?? false,
                    'weight'          => $tc['weight'] ?? 1,
                    'order_column'    => $i,
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

    /**
     * Bulk-add questions from a pasted JSON array — the fast way to load a test /
     * weekly challenge. Each item is either:
     *   MCQ:    { type?:"mcq", body, marks?, explanation?, options:[{option_text,is_correct}] }
     *   Coding: { type:"coding", body, marks?, language?, starter_code?,
     *             test_cases:[{input?, expected_output, is_sample?, weight?}] }
     * (type defaults to "mcq"). Coding items require a grader (Judge0 or AI), and
     * ≥1 test case when Judge0 is on.
     */
    public function storeQuestionsBulk(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'questions'                        => ['required', 'array', 'min:1', 'max:100'],
            'questions.*.type'                 => ['nullable', 'in:mcq,coding'],
            'questions.*.body'                 => ['required', 'string'],
            'questions.*.marks'                => ['nullable', 'integer', 'min:1', 'max:100'],
            'questions.*.explanation'          => ['nullable', 'string'],
            'questions.*.language'             => ['nullable', 'string', 'in:javascript,php,python,java,cpp'],
            'questions.*.starter_code'         => ['nullable', 'string'],
            'questions.*.options'              => ['nullable', 'array', 'min:2', 'max:4'],
            'questions.*.options.*.option_text'=> ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
            'questions.*.test_cases'                   => ['nullable', 'array', 'max:30'],
            'questions.*.test_cases.*.input'           => ['nullable', 'string'],
            'questions.*.test_cases.*.expected_output' => ['required', 'string'],
            'questions.*.test_cases.*.is_sample'       => ['boolean'],
            'questions.*.test_cases.*.weight'          => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $judge0  = (bool) config('devrank.judge0.enabled');
        $codingEnabled = $judge0 || config('devrank.ai.enabled', false);

        // Validate every item up front (all-or-nothing).
        foreach ($validated['questions'] as $i => $q) {
            $type = $q['type'] ?? 'mcq';
            $n = $i + 1;
            if ($type === 'mcq') {
                $opts = $q['options'] ?? [];
                if (count($opts) < 2) {
                    return back()->withErrors(['bulk' => "Question $n (MCQ) needs 2–4 options."]);
                }
                if (collect($opts)->where('is_correct', true)->count() !== 1) {
                    return back()->withErrors(['bulk' => "Question $n must have exactly one correct option."]);
                }
            } else { // coding
                if (! $codingEnabled) {
                    return back()->withErrors(['bulk' => "Question $n is coding, but coding needs a grader (enable Judge0 or AI)."]);
                }
                if ($judge0 && empty($q['test_cases'])) {
                    return back()->withErrors(['bulk' => "Question $n (coding) needs at least one test case."]);
                }
            }
        }

        $order = (int) $quiz->questions()->max('order_column');
        foreach ($validated['questions'] as $q) {
            $type = $q['type'] ?? 'mcq';
            $question = $quiz->questions()->create([
                'body'         => $q['body'],
                'type'         => $type,
                'language'     => $type === 'coding' ? ($q['language'] ?? 'javascript') : null,
                'starter_code' => $type === 'coding' ? ($q['starter_code'] ?? null) : null,
                'marks'        => $q['marks'] ?? 1,
                'explanation'  => $q['explanation'] ?? null,
                'order_column' => ++$order,
            ]);

            if ($type === 'mcq') {
                foreach (array_values($q['options']) as $j => $opt) {
                    QuizOption::create([
                        'question_id'  => $question->id,
                        'option_text'  => $opt['option_text'],
                        'is_correct'   => $opt['is_correct'],
                        'order_column' => $j,
                    ]);
                }
            } else {
                foreach (array_values($q['test_cases'] ?? []) as $j => $tc) {
                    \App\Models\QuestionTestCase::create([
                        'question_id'     => $question->id,
                        'input'           => $tc['input'] ?? null,
                        'expected_output' => $tc['expected_output'],
                        'is_sample'       => $tc['is_sample'] ?? false,
                        'weight'          => $tc['weight'] ?? 1,
                        'order_column'    => $j,
                    ]);
                }
            }
        }

        $quiz->recalculateTotalMarks();

        return back()->with('success', count($validated['questions']) . ' questions imported.');
    }
 
    // ── Attempts: review AI-flagged ──────────────────────────────
    public function attempts(Quiz $quiz)
    {
        $attempts = QuizAttempt::with([
            'user:id,name,total_rank_score',
            'answers.question:id,body,type,language,marks',
            'answers.selectedOption:id,option_text',
        ])
        ->where('quiz_id', $quiz->id)
        ->where('status', 'completed')
        ->latest('completed_at')
        ->paginate(25);
    
        $stats = $this->quizService->getQuizStats($quiz);
    
        return Inertia::render('Admin/Quiz/Attempts', [
            'quiz'     => $quiz->load('tag:id,name'),
            'attempts' => $attempts,
            'stats'    => $stats,
        ]);
    }
}