<?php

return [
    'limits' => [
        'monthly_applications' => 5,
        'monthly_job_posts' => 5,
        'monthly_outreach' => 10,
        'max_tags_per_topic' => 10,
    ],

    'jobs' => [
        'expiry_days' => 30,
    ],

    'upload' => [
        'max_size' => 5120, // KB
        'allowed_images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'allowed_resume' => ['pdf', 'doc', 'docx'],
        'avatar_max_size' => 2048, // KB
    ],

    'points' => [
        'like_received'    => 10,
        'reply_posted'     => 5,
        'answer_accepted'  => 50,
        'quiz_mcq_correct' => 10,
        'quiz_coding_pass' => 40,
        'interview_review' => 15,
    ],

    // AI coding-answer scoring / proctoring (AiScoringService)
    'ai' => [
        // Master switch. When false (phase-1 launch, no ANTHROPIC_API_KEY / no cost):
        //   - quizzes run MCQ-only (coding questions are hidden from candidates and
        //     never sent to the API — zero API calls are made),
        //   - the "% Human" (human_score) metric is hidden in the UI,
        //   - the admin quiz builder blocks new coding questions.
        'enabled'          => env('DEVRANK_AI_ENABLED', false),
        'model'            => env('DEVRANK_AI_MODEL', 'claude-sonnet-4-6'),
        'max_tokens'       => 256,
        'timeout'          => 15,
        'flag_threshold'   => 7.0,   // ai_score >= this => flagged as AI-written
        'heuristic_weight' => 0.30,  // paste/typing signal weight in the blend
        'api_weight'       => 0.70,  // content-analysis signal weight in the blend
        // When the API is unavailable, fall back to the paste/typing heuristic for the
        // flag decision so blatant paste-cheating is still caught (instead of a neutral
        // 5.0 that silently passes). Legit answers still degrade to manual-review grading.
        'flag_on_api_failure' => true,
    ],
];