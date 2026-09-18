<?php

namespace App\Services;

use App\Models\InterviewReview;
use App\Models\MockInterview;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * AI mock interview (#5) — practice built from the REAL interview-board data (the
 * rounds, difficulty and tips candidates have shared), with AI feedback. This is
 * a data moat: nobody else has DevRank's crowd-sourced interview intel.
 *
 * Works in two modes:
 *  - AI on  → questions are AI-generated (grounded in the real data) and the
 *    candidate's answers are scored with per-question + overall feedback.
 *  - AI off → "prep mode": questions are derived directly from the real rounds,
 *    and the session shows the real tips instead of AI grading (no API cost).
 */
class MockInterviewService
{
    private string $apiUrl = 'https://api.anthropic.com/v1/messages';

    public function aiEnabled(): bool
    {
        return (bool) config('devrank.ai.enabled', false);
    }

    /** Companies with interview reviews (for the practice picker), with roles. */
    public function practiceOptions(): array
    {
        return InterviewReview::visible()
            ->selectRaw('company_name, COUNT(*) as reviews')
            ->groupBy('company_name')
            ->orderByDesc('reviews')
            ->limit(30)
            ->get()
            ->map(fn ($r) => [
                'company' => $r->company_name,
                'reviews' => (int) $r->reviews,
                'roles'   => InterviewReview::visible()->where('company_name', $r->company_name)
                    ->distinct()->orderBy('role_applied')->pluck('role_applied')->take(8)->values(),
            ])->all();
    }

    /**
     * Aggregate the real board data for a company/role into grounding material.
     */
    public function prepData(?string $company, ?string $role): array
    {
        $q = InterviewReview::visible();
        if ($company) {
            $q->where('company_name', $company);
        }
        if ($role) {
            $q->where('role_applied', 'like', "%{$role}%");
        }
        $reviews = $q->latest('interview_date')->limit(30)->get();

        // Fall back to the whole board for general practice.
        if ($reviews->isEmpty()) {
            $reviews = InterviewReview::visible()->latest('interview_date')->limit(30)->get();
        }

        $rounds = $reviews->flatMap(fn ($r) => $r->rounds_detail ?? [])
            ->filter(fn ($rd) => ! empty($rd['type']))
            ->map(fn ($rd) => [
                'type'        => $rd['type'] ?? 'Round',
                'difficulty'  => $rd['difficulty'] ?? 'medium',
                'description' => $rd['description'] ?? '',
            ])
            ->unique(fn ($rd) => Str::lower($rd['type']))
            ->take(6)
            ->values()
            ->all();

        return [
            'rounds'     => $rounds,
            'tips'       => $reviews->pluck('tips')->filter()->take(5)->values()->all(),
            'difficulty' => round((float) $reviews->avg('difficulty_rating'), 1),
            'sample_size'=> $reviews->count(),
        ];
    }

    /**
     * Start a mock: build questions (AI or from data) and persist the session.
     */
    public function start(User $user, ?string $company, ?string $role): MockInterview
    {
        $prep = $this->prepData($company, $role);

        $questions = $this->aiEnabled()
            ? $this->generateQuestionsAi($company, $role, $prep)
            : [];

        if (empty($questions)) {
            $questions = $this->questionsFromData($role, $prep); // fallback / prep mode
        }

        $transcript = collect($questions)->map(fn ($q) => [
            'round_type' => $q['round_type'] ?? 'General',
            'question'   => $q['question'],
            'answer'     => '',
            'score'      => null,
            'feedback'   => null,
        ])->all();

        return MockInterview::create([
            'user_id'      => $user->id,
            'company_name' => $company,
            'role'         => $role,
            'status'       => 'in_progress',
            'transcript'   => $transcript,
        ]);
    }

    /**
     * Save the candidate's answers and finish the session — AI-grade when on.
     */
    public function complete(MockInterview $mock, array $answers): MockInterview
    {
        $transcript = $mock->transcript;
        foreach ($transcript as $i => &$row) {
            $row['answer'] = trim((string) ($answers[$i] ?? ''));
        }
        unset($row);

        $overall = null; $summary = null; $graded = false;

        if ($this->aiEnabled()) {
            $eval = $this->evaluateAi($mock->role, $transcript);
            if ($eval) {
                foreach ($transcript as $i => &$row) {
                    $row['score']    = $eval['per_question'][$i]['score']    ?? null;
                    $row['feedback'] = $eval['per_question'][$i]['feedback'] ?? null;
                }
                unset($row);
                $overall = $eval['overall_score'] ?? null;
                $summary = $eval['summary'] ?? null;
                $graded  = true;
            }
        }

        $mock->update([
            'transcript'    => $transcript,
            'status'        => 'completed',
            'ai_graded'     => $graded,
            'overall_score' => $overall,
            'summary'       => $summary,
            'completed_at'  => now(),
        ]);

        return $mock;
    }

    // ── Question generation ──────────────────────────────────────

    private function questionsFromData(?string $role, array $prep): array
    {
        $out = [];
        foreach ($prep['rounds'] as $r) {
            $desc = $r['description'] ? " Reviewers described it as: “{$r['description']}”." : '';
            $out[] = [
                'round_type' => $r['type'],
                'question'   => "This company runs a {$r['type']} ({$r['difficulty']}).{$desc} Walk me through how you'd approach it and what you'd focus on.",
            ];
        }
        // A couple of general questions so there's always something to practise.
        $roleLabel = $role ?: 'this role';
        $out[] = ['round_type' => 'Behavioural', 'question' => "Tell me about a challenging project relevant to {$roleLabel} and the impact you had."];
        $out[] = ['round_type' => 'Motivation', 'question' => "Why this company and this role, and where do you want to grow next?"];

        return array_slice($out, 0, 6);
    }

    private function generateQuestionsAi(?string $company, ?string $role, array $prep): array
    {
        $roundsText = collect($prep['rounds'])
            ->map(fn ($r) => "- {$r['type']} ({$r['difficulty']}): {$r['description']}")
            ->implode("\n") ?: '- (no round data — infer from the role)';
        $tipsText = collect($prep['tips'])->map(fn ($t) => "- {$t}")->implode("\n") ?: '- (none)';
        $companyLabel = $company ?: 'a strong product company';
        $roleLabel = $role ?: 'a software engineering role';

        $prompt = <<<PROMPT
        Generate 5 realistic interview questions for a candidate practising for {$roleLabel} at {$companyLabel}.
        Ground them in what THIS company actually asks, from real candidate reports below.

        REAL INTERVIEW ROUNDS (crowd-sourced):
        {$roundsText}

        CANDIDATE TIPS (crowd-sourced):
        {$tipsText}

        Produce a realistic mix across the reported rounds (technical + behavioural). Each question must be
        answerable in a few paragraphs of text. Respond with ONLY this JSON:
        {"questions":[{"round_type":"...","question":"..."}]}
        PROMPT;

        $json = $this->callAnthropic(
            'You are an expert technical interviewer and coach. Respond ONLY with valid JSON, no other text.',
            $prompt,
            1024
        );

        return is_array($json['questions'] ?? null) ? array_slice($json['questions'], 0, 6) : [];
    }

    private function evaluateAi(?string $role, array $transcript): ?array
    {
        $qa = collect($transcript)->values()->map(function ($row, $i) {
            $n = $i + 1;
            $a = $row['answer'] !== '' ? $row['answer'] : '(no answer given)';
            return "Q{$n} [{$row['round_type']}]: {$row['question']}\nA{$n}: {$a}";
        })->implode("\n\n");

        $roleLabel = $role ?: 'the role';
        $count = count($transcript);

        $prompt = <<<PROMPT
        You are grading a mock interview for {$roleLabel}. For each of the {$count} answers, give a score (0–10)
        and 1–2 sentences of specific, constructive feedback. Then give an overall readiness score (0–100) and a
        2–3 sentence summary (strengths + what to improve). Be honest but encouraging.

        TRANSCRIPT:
        {$qa}

        Respond with ONLY this JSON (per_question in order, exactly {$count} items):
        {"per_question":[{"score":0,"feedback":""}],"overall_score":0,"summary":""}
        PROMPT;

        $json = $this->callAnthropic(
            'You are a senior technical interviewer giving fair, specific, actionable feedback. Respond ONLY with valid JSON.',
            $prompt,
            1500
        );

        if (! isset($json['overall_score'])) {
            return null;
        }

        return [
            'per_question'  => array_map(fn ($p) => [
                'score'    => (int) min(max((int) ($p['score'] ?? 0), 0), 10),
                'feedback' => (string) ($p['feedback'] ?? ''),
            ], is_array($json['per_question'] ?? null) ? $json['per_question'] : []),
            'overall_score' => (int) min(max((int) $json['overall_score'], 0), 100),
            'summary'       => (string) ($json['summary'] ?? ''),
        ];
    }

    /** One Anthropic call returning decoded JSON, or [] on any failure. */
    private function callAnthropic(string $system, string $prompt, int $maxTokens): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout((int) config('devrank.ai.timeout', 30))->post($this->apiUrl, [
                'model'      => config('devrank.ai.model', 'claude-sonnet-4-6'),
                'max_tokens' => $maxTokens,
                'system'     => $system,
                'messages'   => [['role' => 'user', 'content' => $prompt]],
            ]);

            if (! $response->successful()) {
                Log::warning('MockInterview AI call failed', ['status' => $response->status()]);
                return [];
            }

            $content = (string) $response->json('content.0.text', '');
            $clean = trim(preg_replace('/```json|```/', '', $content));
            return json_decode($clean, true, 512, JSON_THROW_ON_ERROR) ?: [];
        } catch (\Throwable $e) {
            Log::warning('MockInterview AI error: ' . $e->getMessage());
            return [];
        }
    }
}
