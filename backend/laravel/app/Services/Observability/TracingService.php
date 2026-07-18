<?php

namespace App\Services\Observability;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TracingService
{
    public function begin(string $name, array $context = []): string
    {
        $traceId = (string) Str::orderedUuid();
        $spanId = (string) Str::orderedUuid();

        Cache::put("trace:{$traceId}", [
            'name' => $name,
            'span_id' => $spanId,
            'started_at' => now()->toDateTimeString(),
            'context' => $context,
        ], now()->addMinutes(5));

        return $traceId;
    }

    public function record(string $traceId, array $payload = []): void
    {
        if ($traceId === '') {
            return;
        }

        $key = "trace:{$traceId}:events";

        Cache::put($key, array_merge((array) Cache::get($key, []), [$payload]), now()->addMinutes(5));
    }

    public function end(string $traceId): void
    {
        if ($traceId === '') {
            return;
        }

        Cache::put("trace:{$traceId}:finished", true, now()->addMinutes(5));
    }
}
