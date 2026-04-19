<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizOption;
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
            ->when($tagSlug, fn ($q) => $q->whereHas('tag', fn ($t) => $t->where('slug', $tagSlug)))
            ->when($difficulty, fn ($q) => $q->where('difficulty', $difficulty))
            ->latest()
            ->paginate(12)
            ->withQueryString();
    }

    // ── Single quiz (for the attempt page) ──────────────────────
    public function getQuiz(string $slug): Quiz
    {
        return Quiz::published()
            ->with([
                'tag:id,name,slug',
                'questions' => fn ($q) => $q->orderBy('order_column'),
                'questions.options' => fn ($q) => $q->orderBy('order_column'),
            ])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    /**
     * Returns quiz data for the attempt page.
     * Options are returned WITHOUT is_correct — never expose correct answer to frontend.
     */
    public function getQuizForAttempt(string $slug): array
    {
        $quiz = $this->getQuiz($slug);

        return [
            'id'                  => $quiz->id,
            'title'               => $quiz->title,
            'description'         => $quiz->description,
            'difficulty'          => $quiz->difficulty,
            'time_limit_minutes'  => $quiz->time_limit_minutes,
            'passing_score'       => $quiz->passing_score,
            'total_marks'         => $quiz->total_marks,
            'tag'                 => $quiz->tag,
            'questions'           => $quiz->questions->map(fn ($q) => [
                'id'           => $q->id,
                'body'         => $q->body,
                'type'         => $q->type,
                'language'     => $q->language,
                'starter_code' => $q->starter_code,
                'marks'        => $q->marks,
                'order_column' => $q->order_column,
                // Options WITHOUT is_correct
                'options'      => $q->isMcq() ? $q->options->map(fn ($o) => [
                    'id'           => $o->id,
                    'option_text'  => $o->option_text,
                    'order_column' => $o->order_column,
                ]) : [],
            ]),
        ];
    }

    // ── Start attempt ────────────────────────────────────────────
    /**
     * Creates the attempt record.
     * Enforces one-attempt-per-quiz rule.
     */
    public function startAttempt(User $user, Quiz $quiz): QuizAttempt
    {
        // One attempt per candidate per quiz — hard block
        $existing = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existing) {
            return $existing; // controller will redirect based on status
        }

        return QuizAttempt::create([
            'user_id'    => $user->id,
            'quiz_id'    => $quiz->id,
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
    }

    // ── Submit one answer ────────────────────────────────────────
    /**
     * Called per-question as the candidate submits each answer.
     * MCQ: graded immediately.
     * Coding: AI-scored asynchronously (queued job in Phase 2; sync for now).
     */
    public function submitAnswer(
        QuizAttempt $attempt,
        int $questionId,
        ?int $selectedOptionId,
        ?string $answerText,
        int $pasteCount,
        int $timeSpentSeconds
    ): QuizAnswer {
        $question = QuizQuestion::with('options')->findOrFail($questionId);

        // Prevent answering twice
        $existing = QuizAnswer::where('attempt_id', $attempt->id)
            ->where('question_id', $questionId)
            ->first();

        if ($existing) return $existing;

        if ($question->isMcq()) {
            return $this->gradeMcq($attempt, $question, $selectedOptionId, $timeSpentSeconds);
        }

        return $this->gradeCoding($attempt, $question, $answerText, $pasteCount, $timeSpentSeconds);
    }

    // ── Complete attempt ─────────────────────────────────────────
    /**
     * Finalise the attempt: calculate total score, award rank points.
     * Called when candidate clicks "Submit Quiz" or timer expires.
     */
    public function completeAttempt(QuizAttempt $attempt, int $timeTakenSeconds): QuizAttempt
    {
        if ($attempt->isCompleted()) return $attempt;

        $answers   = $attempt->answers()->with('question')->get();
        $totalScore = $answers->sum('marks_awarded');
        $totalMarks = $attempt->quiz->total_marks ?: 1;
        $percentage = round(($totalScore / $totalMarks) * 100, 2);
        $passed     = $percentage >= $attempt->quiz->passing_score;
        $aiFlagged  = $answers->contains('ai_flagged', true);

        // Calculate rank points to award
        $rankPoints = $this->calculateRankPoints($answers, $aiFlagged);

        DB::transaction(function () use (
            $attempt, $totalScore, $percentage, $passed,
            $timeTakenSeconds, $aiFlagged, $rankPoints
        ) {
            $attempt->update([
                'status'               => 'completed',
                'score'                => $totalScore,
                'percentage'           => $percentage,
                'passed'               => $passed,
                'time_taken_seconds'   => $timeTakenSeconds,
                'ai_flagged'           => $aiFlagged,
                'rank_points_awarded'  => $rankPoints,
                'completed_at'         => now(),
            ]);

            // Update candidate's total_rank_score
            if ($rankPoints > 0) {
                User::where('id', $attempt->user_id)
                    ->increment('total_rank_score', $rankPoints);
            }
        });

        return $attempt->fresh();
    }

    // ── Attempt result (for result page) ─────────────────────────
    public function getAttemptResult(int $attemptId, int $userId): QuizAttempt
    {
        return QuizAttempt::with([
            'quiz:id,title,slug,passing_score,total_marks,time_limit_minutes',
            'quiz.tag:id,name,slug',
            'answers.question',
            'answers.selectedOption',
        ])
        ->where('id', $attemptId)
        ->where('user_id', $userId)
        ->where('status', 'completed')
        ->firstOrFail();
    }

    // ── Check if user already attempted ─────────────────────────
    public function getExistingAttempt(int $userId, int $quizId): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->first();
    }

    // ── Admin: quiz stats ────────────────────────────────────────
    public function getQuizStats(Quiz $quiz): array
    {
        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('status', 'completed');

        return [
            'total_attempts'  => $attempts->count(),
            'passed'          => $attempts->where('passed', true)->count(),
            'avg_score'       => round($attempts->avg('percentage'), 1),
            'ai_flagged'      => $attempts->where('ai_flagged', true)->count(),
        ];
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
        $marksAwarded  = $isCorrect ? $question->marks : 0;

        return QuizAnswer::create([
            'attempt_id'         => $attempt->id,
            'question_id'        => $question->id,
            'selected_option_id' => $selectedOptionId,
            'is_correct'         => $isCorrect,
            'marks_awarded'      => $marksAwarded,
            'ai_score'           => 0.0,
            'ai_flagged'         => false,
            'paste_count'        => 0,
            'time_spent_seconds' => $timeSpentSeconds,
        ]);
    }

    // ── Private: Coding grading ──────────────────────────────────
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

        // AI scoring — sync for now, can be queued later
        $scored = $this->aiScoring->scoreCodingAnswer(
            questionBody:      $question->body,
            answerCode:        $answerText,
            language:          $question->language ?? 'javascript',
            pasteCount:        $pasteCount,
            timeSpentSeconds:  $timeSpentSeconds
        );

        // Marks awarded based on quality score (0–10 maps to 0–question->marks)
        // If AI flagged → 0 marks (withheld pending admin review)
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

    // ── Private: rank points calculation ─────────────────────────
    private function calculateRankPoints($answers, bool $attemptAiFlagged): int
    {
        $points = config('devrank.points', []);
        $total  = 0;

        foreach ($answers as $answer) {
            // Skip any answer that is AI-flagged — points withheld pending admin review
            if ($answer->ai_flagged) continue;

            if ($answer->question->isMcq()) {
                if ($answer->is_correct) {
                    $total += $points['quiz_mcq_correct'] ?? 10;
                }
            } elseif ($answer->question->isCoding()) {
                $quality = ($answer->question->marks > 0)
                    ? ($answer->marks_awarded / $answer->question->marks) * 10
                    : 0;

                if ($quality >= 9.0) {
                    $total += $points['quiz_coding_pass'] ?? 40;
                } elseif ($quality >= 6.0) {
                    $total += (int) round(($points['quiz_coding_pass'] ?? 40) * 0.6);
                }
            }
        }

        return $total;
    }
}