<?php

namespace App\Services;

use App\Models\QuizQuestion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Objective code execution via Judge0 (#1). Runs a candidate's submission against
 * a question's test cases in a sandbox and reports how many passed — a provable
 * correctness score, independent of the AI human-check. Off by default; enabled
 * only when JUDGE0_URL is configured (self-hosted or RapidAPI).
 */
class Judge0Service
{
    private const STATUS_ACCEPTED = 3; // Judge0: stdout matched expected_output

    public function enabled(): bool
    {
        return (bool) config('devrank.judge0.enabled');
    }

    public function languageId(?string $language): ?int
    {
        return config('devrank.judge0.languages.' . strtolower((string) $language));
    }

    /**
     * Run `source` (in `language`) against `$testCases` (each: input, expected_output,
     * is_sample, weight). Returns a structured result. Never throws — on any failure
     * it returns ['ran' => false] so grading can fall back gracefully.
     *
     * @param  iterable  $testCases  QuestionTestCase models or arrays
     * @param  bool  $revealOutput   include actual stdout per case (for sample "Run tests")
     */
    public function run(string $source, ?string $language, $testCases, bool $revealOutput = false): array
    {
        $failed = ['ran' => false, 'passed' => 0, 'total' => 0, 'weight_passed' => 0, 'weight_total' => 0, 'results' => []];

        if (! $this->enabled() || trim($source) === '') {
            return $failed;
        }

        $languageId = $this->languageId($language);
        if (! $languageId) {
            return $failed;
        }

        $cases = collect($testCases)->take(30);
        if ($cases->isEmpty()) {
            return $failed;
        }

        $passed = 0; $weightPassed = 0; $weightTotal = 0; $results = [];

        foreach ($cases as $case) {
            $expected = $this->val($case, 'expected_output');
            $input    = $this->val($case, 'input');
            $weight   = (int) ($this->val($case, 'weight') ?: 1);
            $isSample = (bool) $this->val($case, 'is_sample');
            $weightTotal += $weight;

            $outcome = $this->submit($source, $languageId, $input, $expected);
            if ($outcome === null) {
                // Sandbox unreachable / error → abort the whole run (fall back).
                return $failed;
            }

            $ok = $outcome['status'] === self::STATUS_ACCEPTED;
            if ($ok) { $passed++; $weightPassed += $weight; }

            $row = ['passed' => $ok, 'status' => $outcome['description'], 'is_sample' => $isSample];
            if ($revealOutput && $isSample) {
                $row['input']    = $input;
                $row['expected'] = $expected;
                $row['actual']   = $outcome['stdout'];
                $row['stderr']   = $outcome['stderr'];
            }
            $results[] = $row;
        }

        return [
            'ran'           => true,
            'passed'        => $passed,
            'total'         => $cases->count(),
            'weight_passed' => $weightPassed,
            'weight_total'  => max(1, $weightTotal),
            'results'       => $results,
        ];
    }

    /** Run only a question's sample cases, revealing outputs (candidate "Run tests"). */
    public function runSamples(string $source, QuizQuestion $question): array
    {
        $samples = $question->testCases()->where('is_sample', true)->get();
        return $this->run($source, $question->language, $samples, true);
    }

    /**
     * One synchronous Judge0 submission. Returns [status, description, stdout, stderr]
     * or null on transport failure.
     */
    private function submit(string $source, int $languageId, ?string $stdin, ?string $expected): ?array
    {
        try {
            $req = Http::timeout((int) config('devrank.judge0.timeout', 20))
                ->acceptJson()->asJson();

            if ($key = config('devrank.judge0.key')) {
                $req = $req->withHeaders(array_filter([
                    'X-RapidAPI-Key'  => $key,
                    'X-RapidAPI-Host' => config('devrank.judge0.host'),
                ]));
            }

            $response = $req->post(
                config('devrank.judge0.url') . '/submissions?base64_encoded=false&wait=true',
                array_filter([
                    'source_code'     => $source,
                    'language_id'     => $languageId,
                    'stdin'           => $stdin,
                    'expected_output' => $expected,
                ], fn ($v) => $v !== null)
            );

            if (! $response->successful()) {
                Log::warning('Judge0 submission failed: HTTP ' . $response->status());
                return null;
            }

            $data = $response->json();
            return [
                'status'      => (int) ($data['status']['id'] ?? 0),
                'description' => (string) ($data['status']['description'] ?? 'Unknown'),
                'stdout'      => $data['stdout'] ?? null,
                'stderr'      => $data['stderr'] ?? ($data['compile_output'] ?? null),
            ];
        } catch (\Throwable $e) {
            Log::warning('Judge0 error: ' . $e->getMessage());
            return null;
        }
    }

    private function val($case, string $key)
    {
        return is_array($case) ? ($case[$key] ?? null) : ($case->{$key} ?? null);
    }
}
