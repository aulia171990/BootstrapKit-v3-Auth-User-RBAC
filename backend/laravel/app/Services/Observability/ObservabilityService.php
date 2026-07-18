<?php

namespace App\Services\Observability;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ObservabilityService
{
    public function __construct(
        private HealthCheckService $health,
        private MetricsService $metrics,
        private LoggingService $logging,
    ) {}

    public function snapshot(): array
    {
        return [
            'health' => $this->health->database() + $this->health->cache() + $this->health->queue() + $this->health->storage(),
            'metrics' => [
                'requests' => Cache::get('metrics:requests:count', 0),
                'exceptions' => Cache::get('metrics:exceptions:count', 0),
                'rate_limits' => Cache::get('metrics:rate_limit:count', 0),
                'webhooks' => Cache::get('metrics:webhooks:count', 0),
            ],
            'tracing' => config('observability.tracing.enabled') ? ['enabled' => true] : ['enabled' => false],
        ];
    }

    public function startTrace(string $name): string
    {
        if (! config('observability.tracing.enabled')) {
            return '';
        }

        $traceId = (string) Str::orderedUuid();
        Cache::put("trace:{$traceId}", ['name' => $name, 'started_at' => now()->toDateTimeString()], now()->addMinutes(5));

        return $traceId;
    }

    public function finishTrace(string $traceId): void
    {
        if ($traceId === '') {
            return;
        }

        Cache::put("trace:{$traceId}:finished", true, now()->addMinutes(5));
    }
}
