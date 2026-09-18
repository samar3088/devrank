<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    public function __construct(private QuizService $quizService) {}

    // ── Start or resume attempt ──────────────────────────────────
    public function start(Quiz $quiz)
    {
        $result = $this->quizService->startAttempt(auth()->user(), $quiz);

        if ($result['error']) {
            return redirect()->route('quiz.show', $quiz->slug)
                ->with('error', $result['error']);
        }

        $attempt = $result['attempt'];

        // Already completed (shouldn't happen via normal flow, safety net)
        if ($attempt->isCompleted()) {
            return redirect()->route('quiz.result', $attempt->id)
                ->with('info', 'You have already completed this attempt.');
        }

        return Inertia::render('Quiz/Attempt', [
            'quiz'          => $this->quizService->getQuizForAttempt($quiz->slug),
            'attemptId'     => $attempt->id,
            'attemptNumber' => $attempt->attempt_number,
        ]);
    }

    // ── Submit one answer (JSON) ─────────────────────────────────
    public function answer(Request $request, QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);
        abort_unless($attempt->isInProgress(), 422, 'Attempt already completed.');

        $validated = $request->validate([
            // Scope the question to THIS attempt's quiz — otherwise a candidate
            // could grade answers to easier questions from another quiz and
            // inflate their score/percentage.
            'question_id'        => ['required', 'integer', \Illuminate\Validation\Rule::exists('quiz_questions', 'id')->where('quiz_id', $attempt->quiz_id)],
            'selected_option_id' => ['nullable', 'integer', 'exists:quiz_options,id'],
            'answer_text'        => ['nullable', 'string', 'max:10000'],
            'paste_count'        => ['integer', 'min:0'],
            'time_spent_seconds' => ['integer', 'min:0'],
        ]);

        $answer = $this->quizService->submitAnswer(
            attempt:          $attempt,
            questionId:       $validated['question_id'],
            selectedOptionId: $validated['selected_option_id'] ?? null,
            answerText:       $validated['answer_text'] ?? null,
            pasteCount:       $validated['paste_count'] ?? 0,
            timeSpentSeconds: $validated['time_spent_seconds'] ?? 0,
        );

        return response()->json([
            'success'    => true,
            'ai_flagged' => $answer->ai_flagged,
        ]);
    }

    // ── Run sample tests (Judge0) without submitting ─────────────
    public function runTests(Request $request, QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);
        abort_unless($attempt->isInProgress(), 422, 'Attempt already completed.');
        abort_unless(config('devrank.judge0.enabled'), 404);

        $validated = $request->validate([
            'question_id' => ['required', 'integer', 'exists:quiz_questions,id'],
            'answer_text' => ['required', 'string', 'max:10000'],
        ]);

        $question = \App\Models\QuizQuestion::where('quiz_id', $attempt->quiz_id)
            ->findOrFail($validated['question_id']);
        abort_unless($question->isCoding(), 422, 'Not a coding question.');

        $result = app(\App\Services\Judge0Service::class)->runSamples($validated['answer_text'], $question);

        return response()->json($result);
    }

    // ── Complete attempt ─────────────────────────────────────────
    public function complete(Request $request, QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'time_taken_seconds' => ['required', 'integer', 'min:0'],
        ]);

        // Enforce time limit with 30s grace
        $maxAllowed = ($attempt->quiz->time_limit_minutes * 60) + 30;
        $timeTaken  = min($validated['time_taken_seconds'], $maxAllowed);

        $attempt = $this->quizService->completeAttempt($attempt, $timeTaken);

        return redirect()->route('quiz.result', $attempt->id)
            ->with('success', 'Quiz submitted!');
    }

    // ── Result page ──────────────────────────────────────────────
    public function result(QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);

        $completed = $this->quizService->getAttemptResult($attempt->id, auth()->id());

        // Pass attempts summary so result page can show history
        $summary = $this->quizService->getAttemptsSummary(
            auth()->id(),
            $completed->quiz
        );

        return Inertia::render('Quiz/Result', [
            'attempt' => $completed,
            'summary' => $summary,
        ]);
    }
}