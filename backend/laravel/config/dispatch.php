<?php

return [
    'use_queue' => env('DISPATCH_QUEUE', true),
    'search_radius_km' => env('DISPATCH_SEARCH_RADIUS_KM', 5),
    'offer_timeout_seconds' => env('DISPATCH_OFFER_TIMEOUT_SECONDS', 10),
    'max_attempts' => env('DISPATCH_MAX_ATTEMPTS', 5),
    'retry_after_seconds' => env('DISPATCH_RETRY_AFTER_SECONDS', 60),
    'strategy' => env('DISPATCH_STRATEGY', 'highest_score'),
    'strategies' => [
        'nearest_driver' => \App\Services\Strategies\NearestDriverStrategy::class,
        'highest_score' => \App\Services\Strategies\HighestScoreStrategy::class,
        'balanced_load' => \App\Services\Strategies\BalancedLoadStrategy::class,
        'preferred_driver' => \App\Services\Strategies\PreferredDriverStrategy::class,
    ],
    'scoring' => [
        'distance_weight' => env('DISPATCH_SCORE_DISTANCE_WEIGHT', 0.45),
        'rating_weight' => env('DISPATCH_SCORE_RATING_WEIGHT', 0.25),
        'acceptance_rate_weight' => env('DISPATCH_SCORE_ACCEPTANCE_WEIGHT', 0.2),
        'cancellation_rate_weight' => env('DISPATCH_SCORE_CANCELLATION_WEIGHT', 0.1),
        'idle_time_weight' => env('DISPATCH_SCORE_IDLE_WEIGHT', 0.0),
    ],
    'eligible_statuses' => [
        'approved',
        'verified',
        'online',
        'available',
    ],
    'disabled_statuses' => [
        'suspended',
    ],
];
