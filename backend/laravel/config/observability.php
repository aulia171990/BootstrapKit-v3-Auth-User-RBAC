<?php

return [
    'enabled' => env('OBSERVABILITY_ENABLED', true),

    'metrics' => [
        'enabled' => env('OBSERVABILITY_METRICS_ENABLED', true),
        'provider' => env('OBSERVABILITY_METRICS_PROVIDER', 'memory'),
        'prefix' => env('OBSERVABILITY_METRICS_PREFIX', 'ojol'),
    ],

    'tracing' => [
        'enabled' => env('OBSERVABILITY_TRACING_ENABLED', false),
        'sampling_rate' => (float) env('OBSERVABILITY_TRACING_SAMPLING_RATE', 0.1),
        'exporters' => [
            'jaeger' => env('OBSERVABILITY_JAEGER_ENDPOINT', 'http://localhost:14268/api/traces'),
            'tempo' => env('OBSERVABILITY_TEMPO_ENDPOINT', null),
        ],
    ],

    'health' => [
        'checks' => [
            'database' => \App\Services\Observability\HealthCheckService::class,
            'redis' => \App\Services\Observability\HealthCheckService::class,
            'queue' => \App\Services\Observability\HealthCheckService::class,
            'storage' => \App\Services\Observability\HealthCheckService::class,
        ],
    ],

    'security' => [
        'allowed_ips' => env('OBSERVABILITY_ALLOWED_IPS', ''),
        'require_auth' => env('OBSERVABILITY_REQUIRE_AUTH', true),
    ],
];
