<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiScoringService
{
    private string $apiUrl = 'https://api.anthropic.com/v1/messages';

    // Tunables live in config/devrank.php ('ai.*') so the model, threshold,
    // blend weights and outage behaviour can change without code edits.
    private function cfg(string $key, mixed $default = null): mixed
    {
        return config("devrank.ai.{$key}", $default);
    }

    /**
     * Score a coding answer for AI likelihood + correctness hint.
     *
     * Returns:
     *   ai_score     float  0.0–10.0  (higher = more likely AI-written)
     *   ai_flagged   bool
     *   quality      float  0.0–10.0  (code quality / correctness estimate)
     *   feedback     string  short note for admin review
     */
    public function scoreCodingAnswer(
        string $questionBody,
        string $answerCode,
        string $language,
        int $pasteCount,
        int $timeSpentSeconds
    ): array {
        // Fast heuristic signals (no API call needed for obvious cases)
        $heuristicScore = $this->computeHeuristicScore($answerCode, $pasteCount, $timeSpentSeconds);

        // Always call API for the content analysis component
        $apiResult = $this->callAiDetectionApi($questionBody, $answerCode, $language, 'coding');

        if ($apiResult['api_ok']) {
            // Weighted blend: paste/time heuristic + API content analysis
            $finalAiScore = round(
                ($heuristicScore * (float) $this->cfg('heuristic_weight', 0.30))
                + ($apiResult['ai_score'] * (float) $this->cfg('api_weight', 0.70)),
                2
            );
        } elseif ($this->cfg('flag_on_api_failure', true)) {
            // API down: lean entirely on the paste/typing heuristic so obvious
            // paste-cheating is still caught rather than silently passing.
            $finalAiScore = round($heuristicScore, 2);
        } else {
            $finalAiScore = round(
                ($heuristicScore * (float) $this->cfg('heuristic_weight', 0.30))
                + ($apiResult['ai_score'] * (float) $this->cfg('api_weight', 0.70)),
                2
            );
        }

        return [
            'ai_score'   => $finalAiScore,
            'ai_flagged' => $finalAiScore >= (float) $this->cfg('flag_threshold', 7.0),
            'quality'    => $apiResult['quality'],
            'feedback'   => $apiResult['feedback'],
        ];
    }

    /**
     * Score an MCQ answer — no AI detection needed, just mark correct/wrong.
     * Included here for a unified interface.
     */
    public function scoreMcqAnswer(int $selectedOptionId, int $correctOptionId): array
    {
        $isCorrect = $selectedOptionId === $correctOptionId;
        return [
            'is_correct' => $isCorrect,
            'ai_score'   => 0.0,
            'ai_flagged' => false,
            'quality'    => $isCorrect ? 10.0 : 0.0,
            'feedback'   => '',
        ];
    }

    // ── Private helpers ──────────────────────────────────────────

    /**
     * Heuristic signals: paste count + typing speed.
     * Returns a score 0–10 (higher = more suspicious).
     */
    private function computeHeuristicScore(string $answer, int $pasteCount, int $timeSpentSeconds): float
    {
        $score = 0.0;
        $charCount = mb_strlen(trim($answer));

        // Paste signal: any paste at all is suspicious for a coding question
        if ($pasteCount >= 1) $score += 4.0;
        if ($pasteCount >= 3) $score += 2.0;  // stacks

        // Speed signal: chars per second
        // Humans type ~4–6 chars/sec including thinking time
        // AI-paste would be near-instant → very high chars/sec
        if ($timeSpentSeconds > 0 && $charCount > 0) {
            $cps = $charCount / $timeSpentSeconds;
            if ($cps > 20) $score += 4.0;      // almost certainly pasted
            elseif ($cps > 10) $score += 2.0;  // suspicious
            elseif ($cps > 6)  $score += 1.0;  // slightly fast
        }

        return min($score, 10.0);
    }

    /**
     * Call Anthropic API to analyse the answer content for AI likelihood.
     */
    private function callAiDetectionApi(
        string $question,
        string $answer,
        string $language,
        string $type
    ): array {
        $prompt = $this->buildPrompt($question, $answer, $language, $type);

        try {
            $response = Http::withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout((int) $this->cfg('timeout', 15))->post($this->apiUrl, [
                'model'      => $this->cfg('model', 'claude-sonnet-4-6'),
                'max_tokens' => (int) $this->cfg('max_tokens', 256),
                'system'     => 'You are an expert AI detection system for technical assessments. You respond ONLY with valid JSON and nothing else.',
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->successful()) {
                $content = $response->json('content.0.text', '');
                return $this->parseApiResponse($content);
            }

            Log::warning('AiScoringService: API call failed', ['status' => $response->status()]);
        } catch (\Throwable $e) {
            Log::error('AiScoringService: Exception', ['error' => $e->getMessage()]);
        }

        // Fallback if API fails — signal api_ok:false so the caller can fall back
        // to the paste/typing heuristic for the flag decision.
        return ['ai_score' => 5.0, 'quality' => 5.0, 'feedback' => 'AI scoring unavailable — manual review required.', 'api_ok' => false];
    }

    private function buildPrompt(string $question, string $answer, string $language, string $type): string
    {
        return <<<PROMPT
        You are analysing a candidate's answer to a technical quiz question to detect if it was AI-generated.

        QUESTION:
        {$question}

        CANDIDATE'S ANSWER ({$language}):
        {$answer}

        Evaluate the following and respond ONLY with a JSON object:

        1. ai_score (float 0–10): Likelihood this answer was written by AI (not the candidate).
           - 0–3: Clearly human (personal style, minor errors, natural thinking pattern)
           - 4–6: Uncertain
           - 7–10: Strong AI indicators (perfect formatting, generic explanations, no personal voice, AI-typical phrasing)

        2. quality (float 0–10): Technical correctness and quality of the answer.
           - 0 = completely wrong
           - 10 = perfect solution

        3. feedback (string, max 100 chars): One-line note for the admin reviewing this answer.

        Respond with ONLY this JSON, no other text:
        {"ai_score": 0.0, "quality": 0.0, "feedback": ""}
        PROMPT;
    }

    private function parseApiResponse(string $content): array
    {
        try {
            // Strip any accidental markdown fences
            $clean = preg_replace('/```json|```/', '', $content);
            $data  = json_decode(trim($clean), true, 512, JSON_THROW_ON_ERROR);

            return [
                'ai_score' => (float) min(max($data['ai_score'] ?? 5.0, 0), 10),
                'quality'  => (float) min(max($data['quality']  ?? 5.0, 0), 10),
                'feedback' => (string) ($data['feedback'] ?? ''),
                'api_ok'   => true,
            ];
        } catch (\Throwable) {
            // Unparseable response — treat like an outage for the flag decision.
            return ['ai_score' => 5.0, 'quality' => 5.0, 'feedback' => 'Parse error — manual review.', 'api_ok' => false];
        }
    }
}