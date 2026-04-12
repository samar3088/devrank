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
];