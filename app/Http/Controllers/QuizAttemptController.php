<?php

// ============================================================
// app/Http/Controllers/QuizAttemptController.php
// Candidate: start, answer, submit
// ============================================================
namespace App\Http\Controllers;
 
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class QuizAttemptController extends Controller
{
    public function __construct(private QuizService $quizService) {}
 
    /**
     * Start or resume an attempt.
     * One attempt only — if completed, redirect to result.
     */
    public function start(Quiz $quiz)
    {
        $user    = auth()->user();
        $attempt = $this->quizService->startAttempt($user, $quiz);
 
        if ($attempt->isCompleted()) {
            return redirect()->route('quiz.result', $attempt->id)
                ->with('info', 'You have already completed this quiz.');
        }
 
        return Inertia::render('Quiz/Attempt', [
            'quiz'      => $this->quizService->getQuizForAttempt($quiz->slug),
            'attemptId' => $attempt->id,
        ]);
    }
 
    /**
     * Submit one answer (called per question via fetch/axios from frontend).
     * Returns JSON — not an Inertia response.
     */
    public function answer(Request $request, QuizAttempt $attempt)
    {
        // Ensure this attempt belongs to the authenticated user
        abort_unless($attempt->user_id === auth()->id(), 403);
        abort_unless($attempt->isInProgress(), 422, 'Attempt already completed.');
 
        $validated = $request->validate([
            'question_id'        => ['required', 'integer', 'exists:quiz_questions,id'],
            'selected_option_id' => ['nullable', 'integer', 'exists:quiz_options,id'],
            'answer_text'        => ['nullable', 'string', 'max:10000'],
            'paste_count'        => ['integer', 'min:0'],
            'time_spent_seconds' => ['integer', 'min:0'],
        ]);
 
        $answer = $this->quizService->submitAnswer(
            attempt:           $attempt,
            questionId:        $validated['question_id'],
            selectedOptionId:  $validated['selected_option_id'] ?? null,
            answerText:        $validated['answer_text'] ?? null,
            pasteCount:        $validated['paste_count'] ?? 0,
            timeSpentSeconds:  $validated['time_spent_seconds'] ?? 0,
        );
 
        return response()->json([
            'success'    => true,
            'ai_flagged' => $answer->ai_flagged,
        ]);
    }
 
    /**
     * Complete the entire attempt.
     */
    public function complete(Request $request, QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);
 
        $validated = $request->validate([
            'time_taken_seconds' => ['required', 'integer', 'min:0'],
        ]);
 
        // Time limit enforcement (30s grace period)
        $maxAllowed = ($attempt->quiz->time_limit_minutes * 60) + 30;
        $timeTaken  = min($validated['time_taken_seconds'], $maxAllowed);
 
        $attempt = $this->quizService->completeAttempt($attempt, $timeTaken);
 
        return redirect()->route('quiz.result', $attempt->id)
            ->with('success', 'Quiz submitted successfully!');
    }
 
    /**
     * Show result page for a completed attempt.
     */
    public function result(int $attemptId)
    {
        $attempt = $this->quizService->getAttemptResult($attemptId, auth()->id());
 
        return Inertia::render('Quiz/Result', [
            'attempt' => $attempt,
        ]);
    }
}