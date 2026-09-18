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

    // Company response SLA (feeds trust_score, enforces hiring conduct).
    'sla' => [
        // Days a company has to respond to (i.e. move off "applied") a job
        // application before it counts as an un-responded breach against trust.
        'response_days'   => 14,
        // Blend weights for trust_score: interview-board ghosting vs. application
        // response conduct. Only the signals a company actually has are counted,
        // so a company with reviews but no applications behaves exactly as before.
        'ghost_weight'    => 0.6,
        'response_weight' => 0.4,
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
        // Awarded once when a candidate verifies GitHub ownership (bootstrap signal).
        'github_verified'  => 50,
    ],

    // GitHub import — verified contribution signal (Socialite OAuth).
    // Master switch: only enabled when a GitHub OAuth app is configured, so the
    // "Connect GitHub" UI/routes stay hidden with no credentials (like ai.enabled).
    'github' => [
        'enabled' => (bool) env('GITHUB_CLIENT_ID'),
        // Rank points earned per real contribution signal, each capped so a
        // popular account can't dwarf earned platform activity.
        'points'  => [
            'per_repo'        => 2,   // capped
            'max_repo_points' => 40,
            'per_10_stars'    => 3,   // capped
            'max_star_points' => 60,
            'per_10_followers'=> 2,   // capped
            'max_follower_points' => 30,
        ],
    ],

    // Verifiable embeddable rank credentials (#2). Secret keys the optional HMAC
    // receipt stamped on the verify page; falls back to APP_KEY.
    'credentials' => [
        'secret' => env('DEVRANK_CREDENTIAL_SECRET', env('APP_KEY')),
    ],

    // DPDP (Digital Personal Data Protection Act, 2023) — data-fiduciary details
    // surfaced in the privacy notice and grievance flow. Override via env in prod.
    'privacy' => [
        'entity_name'      => env('DEVRANK_ENTITY_NAME', 'DevRank'),
        'grievance_email'  => env('DEVRANK_GRIEVANCE_EMAIL', 'privacy@devrank.com'),
        'grievance_officer'=> env('DEVRANK_GRIEVANCE_OFFICER', 'Data Protection Officer'),
        // How long inactive personal data is retained before erasure (informational).
        'retention_note'   => 'Account data is kept while your account is active and removed on erasure request.',
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