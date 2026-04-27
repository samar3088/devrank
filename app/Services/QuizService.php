<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuizService
{
    public function __construct(private AiScoringService $aiScoring) {}

    // ── Public listing ───────────────────────────────────────────
    public function getPublishedQuizzes(?string $tagSlug = null, ?string $difficulty = null)
    {
        return Quiz::published()
            ->with(['tag:id,name,slug', 'creator:id,name'])
            ->withCount('questions')
            ->when($tagSlug,    fn ($q) => $q->whereHas('tag', fn ($t) => $t->where('slug', $tagSlug)))
            ->when($difficulty, fn ($q) => $q->where('difficulty', $difficulty))
            ->latest()
            ->paginate(12)
            ->withQueryString();
    }

    // ── Single quiz data for attempt page ────────────────────────
    public function getQuizForAttempt(string $slug): array
    {
        $quiz = Quiz::published()
            ->with([
                'tag:id,name,slug',
                'questions'         => fn ($q) => $q->orderBy('order_column'),
                'questions.options' => fn ($q) => $q->orderBy('order_column'),
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return [
            'id'                 => $quiz->id,
            'title'              => $quiz->title,
            'description'        => $quiz->description,
            'difficulty'         => $quiz->difficulty,
            'time_limit_minutes' => $quiz->time_limit_minutes,
            'passing_score'      => $quiz->passing_score,
            'total_marks'        => $quiz->total_marks,
            'max_attempts'       => $quiz->max_attempts,
            'tag'                => $quiz->tag,
            'questions'          => $quiz->questions->map(fn ($q) => [
                'id'           => $q->id,
                'body'         => $q->body,
                'type'         => $q->type,
                'language'     => $q->language,
                'starter_code' => $q->starter_code,
                'marks'        => $q->marks,
                'order_column' => $q->order_column,
                'options'      => $q->isMcq() ? $q->options->map(fn ($o) => [
                    'id'           => $o->id,
                    'option_text'  => $o->option_text,
                    'order_column' => $o->order_column,
                ]) : [],
            ]),
        ];
    }

    // ── Attempts summary for Show page ───────────────────────────
    public function getAttemptsSummary(int $userId, Quiz $quiz): array
    {
        $attempts = QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quiz->id)
            ->orderBy('attempt_number')
            ->get(['id', 'attempt_number', 'status', 'score', 'percentage',
                   'passed', 'ai_flagged', 'rank_points_awarded', 'completed_at']);

        $completed      = $attempts->where('status', 'completed');
        $inProgress     = $attempts->firstWhere('status', 'in_progress');
        $completedCount = $completed->count();
        $maxAttempts    = $quiz->max_attempts;
        $bestAttempt    = $completed->sortByDesc('score')->first();

        return [
            'attempts'        => $attempts->values(),
            'completed_count' => $completedCount,
            'max_attempts'    => $maxAttempts,
            'remaining'       => $maxAttempts === 0 ? null : max(0, $maxAttempts - $completedCount),
            'can_attempt'     => $maxAttempts === 0 || $completedCount < $maxAttempts,
            'in_progress'     => $inProgress,
            'best_attempt'    => $bestAttempt,
            'best_score'      => $bestAttempt?->score ?? 0,
            'best_percentage' => $bestAttempt?->percentage ?? 0,
        ];
    }

    public function getExistingAttempt(int $userId, int $quizId): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->latest()
            ->first();
    }

    // ── Start a new attempt ──────────────────────────────────────
    /**
     * Rules:
     *  - Resume any in_progress attempt (never create a second in_progress)
     *  - max_attempts = 0 → unlimited
     *  - max_attempts = N → block if completed_count >= N
     *  - Record attempt_number and previous_best_score for delta ranking
     */
    public function startAttempt(User $user, Quiz $quiz): array
    {
        $allAttempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->get();

        // Resume existing in_progress
        $inProgress = $allAttempts->firstWhere('status', 'in_progress');
        if ($inProgress) {
            return ['attempt' => $inProgress, 'error' => null];
        }

        $completedCount = $allAttempts->where('status', 'completed')->count();
        $maxAttempts    = $quiz->max_attempts;

        if ($maxAttempts > 0 && $completedCount >= $maxAttempts) {
            $label = $maxAttempts === 1 ? '1 attempt' : "{$maxAttempts} attempts";
            return [
                'attempt' => null,
                'error'   => "You have used all {$label} allowed for this quiz.",
            ];
        }

        // Best completed score so far — used for delta calculation at completion
        $bestScore = $allAttempts->where('status', 'completed')->max('score');

        $attempt = QuizAttempt::create([
            'user_id'             => $user->id,
            'quiz_id'             => $quiz->id,
            'attempt_number'      => $completedCount + 1,
            'status'              => 'in_progress',
            'previous_best_score' => $bestScore ?? null,
            'started_at'          => now(),
        ]);

        return ['attempt' => $attempt, 'error' => null];
    }

    // ── Submit one answer ────────────────────────────────────────
    public function submitAnswer(
        QuizAttempt $attempt,
        int $questionId,
        ?int $selectedOptionId,
        ?string $answerText,
        int $pasteCount,
        int $timeSpentSeconds
    ): QuizAnswer {
        $question = QuizQuestion::with('options')->findOrFail($questionId);

        $existing = QuizAnswer::where('attempt_id', $attempt->id)
            ->where('question_id', $questionId)
            ->first();

        if ($existing) return $existing;

        if ($question->isMcq()) {
            return $this->gradeMcq($attempt, $question, $selectedOptionId, $timeSpentSeconds);
        }

        return $this->gradeCoding($attempt, $question, $answerText, $pasteCount, $timeSpentSeconds);
    }

    // ── Complete attempt + update rankings ───────────────────────
    /**
     * RANKING LOGIC:
     *
     * Attempt 1 on any quiz:
     *   → Award full points for this attempt's performance
     *
     * Attempt 2+ on a quiz (when max_attempts > 1):
     *   → Calculate points for THIS attempt as if it were standalone
     *   → Find points awarded on the previous BEST attempt
     *   → Delta = points_this_attempt - best_previous_points
     *   → If delta > 0: award delta to total_rank_score (improvement)
     *   → If delta <= 0: award 0 (no rank change, score didn't improve)
     *
     * AI-flagged answers always contribute 0 points regardless.
     *
     * Result: A candidate's total rank contribution from any quiz
     * always equals exactly what they would have earned on their best attempt.
     * Retaking cannot decrease rank. Retaking can only improve rank if score improves.
     */
    public function completeAttempt(QuizAttempt $attempt, int $timeTakenSeconds): QuizAttempt
    {
        if ($attempt->isCompleted()) return $attempt;

        $answers    = $attempt->answers()->with('question')->get();
        $totalScore = $answers->sum('marks_awarded');
        $totalMarks = $attempt->quiz->total_marks ?: 1;
        $percentage = round(($totalScore / $totalMarks) * 100, 2);
        $passed     = $percentage >= $attempt->quiz->passing_score;
        $aiFlagged  = $answers->contains('ai_flagged', true);

        // Points this attempt would earn standalone
        $pointsThisAttempt = $this->calculateRankPoints($answers, $aiFlagged);

        // Delta: only award improvement over previous best
        $rankPointsToAward = $this->calculateDeltaPoints($attempt, $pointsThisAttempt);

        DB::transaction(function () use (
            $attempt, $totalScore, $percentage, $passed,
            $timeTakenSeconds, $aiFlagged, $rankPointsToAward
        ) {
            $attempt->update([
                'status'              => 'completed',
                'score'               => $totalScore,
                'percentage'          => $percentage,
                'passed'              => $passed,
                'time_taken_seconds'  => $timeTakenSeconds,
                'ai_flagged'          => $aiFlagged,
                'rank_points_awarded' => $rankPointsToAward,
                'completed_at'        => now(),
            ]);

            // Only increment rank by the improvement delta
            if ($rankPointsToAward > 0) {
                User::where('id', $attempt->user_id)
                    ->increment('total_rank_score', $rankPointsToAward);
            }
        });

        return $attempt->fresh();
    }

    // ── Result page data ─────────────────────────────────────────
    public function getAttemptResult(int $attemptId, int $userId): QuizAttempt
    {
        return QuizAttempt::with([
            'quiz:id,title,slug,passing_score,total_marks,time_limit_minutes,max_attempts',
            'quiz.tag:id,name,slug',
            'answers.question',
            'answers.selectedOption',
        ])
        ->where('id', $attemptId)
        ->where('user_id', $userId)
        ->where('status', 'completed')
        ->firstOrFail();
    }

    // ── Admin stats ──────────────────────────────────────────────
    public function getQuizStats(Quiz $quiz): array
    {
        $q = QuizAttempt::where('quiz_id', $quiz->id)->where('status', 'completed');

        return [
            'total_attempts' => $q->count(),
            'passed'         => $q->where('passed', true)->count(),
            'avg_score'      => round($q->avg('percentage'), 1),
            'ai_flagged'     => $q->where('ai_flagged', true)->count(),
        ];
    }

    // ── Private: delta ranking ───────────────────────────────────
    private function calculateDeltaPoints(QuizAttempt $attempt, int $pointsThisAttempt): int
    {
        // First attempt — no history, award full points
        if ($attempt->attempt_number === 1 || $attempt->previous_best_score === null) {
            return $pointsThisAttempt;
        }

        // Find the highest rank_points_awarded on any previous completed attempt
        $bestPreviousPoints = QuizAttempt::where('user_id', $attempt->user_id)
            ->where('quiz_id', $attempt->quiz_id)
            ->where('status', 'completed')
            ->where('id', '!=', $attempt->id)
            ->max('rank_points_awarded') ?? 0;

        return max(0, $pointsThisAttempt - $bestPreviousPoints);
    }

    // ── Private: MCQ grading ─────────────────────────────────────
    private function gradeMcq(
        QuizAttempt $attempt,
        QuizQuestion $question,
        ?int $selectedOptionId,
        int $timeSpentSeconds
    ): QuizAnswer {
        $correctOption = $question->options->firstWhere('is_correct', true);
        $isCorrect     = $selectedOptionId && $correctOption
                         && $selectedOptionId === $correctOption->id;

        return QuizAnswer::create([
            'attempt_id'         => $attempt->id,
            'question_id'        => $question->id,
            'selected_option_id' => $selectedOptionId,
            'is_correct'         => $isCorrect,
            'marks_awarded'      => $isCorrect ? $question->marks : 0,
            'ai_score'           => 0.0,
            'ai_flagged'         => false,
            'paste_count'        => 0,
            'time_spent_seconds' => $timeSpentSeconds,
        ]);
    }

    // ── Private: coding grading ──────────────────────────────────
    private function gradeCoding(
        QuizAttempt $attempt,
        QuizQuestion $question,
        ?string $answerText,
        int $pasteCount,
        int $timeSpentSeconds
    ): QuizAnswer {
        $answerText = trim($answerText ?? '');

        if (empty($answerText)) {
            return QuizAnswer::create([
                'attempt_id'         => $attempt->id,
                'question_id'        => $question->id,
                'answer_text'        => '',
                'is_correct'         => false,
                'marks_awarded'      => 0,
                'ai_score'           => 0.0,
                'ai_flagged'         => false,
                'paste_count'        => $pasteCount,
                'time_spent_seconds' => $timeSpentSeconds,
            ]);
        }

        $scored = $this->aiScoring->scoreCodingAnswer(
            questionBody:     $question->body,
            answerCode:       $answerText,
            language:         $question->language ?? 'javascript',
            pasteCount:       $pasteCount,
            timeSpentSeconds: $timeSpentSeconds
        );

        $marksAwarded = $scored['ai_flagged']
            ? 0
            : (int) round(($scored['quality'] / 10) * $question->marks);

        return QuizAnswer::create([
            'attempt_id'         => $attempt->id,
            'question_id'        => $question->id,
            'answer_text'        => $answerText,
            'is_correct'         => $scored['quality'] >= 7.0,
            'marks_awarded'      => $marksAwarded,
            'ai_score'           => $scored['ai_score'],
            'ai_flagged'         => $scored['ai_flagged'],
            'paste_count'        => $pasteCount,
            'time_spent_seconds' => $timeSpentSeconds,
        ]);
    }

    // ── Private: points for an attempt ──────────────────────────
    private function calculateRankPoints($answers, bool $aiFlagged): int
    {
        $pts   = config('devrank.points', []);
        $total = 0;

        foreach ($answers as $answer) {
            if ($answer->ai_flagged) continue;

            if ($answer->question->isMcq() && $answer->is_correct) {
                $total += $pts['quiz_mcq_correct'] ?? 10;
            } elseif ($answer->question->isCoding()) {
                $quality = $answer->question->marks > 0
                    ? ($answer->marks_awarded / $answer->question->marks) * 10
                    : 0;

                if ($quality >= 9.0)     $total += $pts['quiz_coding_pass'] ?? 40;
                elseif ($quality >= 6.0) $total += (int) round(($pts['quiz_coding_pass'] ?? 40) * 0.6);
            }
        }

        return $total;
    }
}