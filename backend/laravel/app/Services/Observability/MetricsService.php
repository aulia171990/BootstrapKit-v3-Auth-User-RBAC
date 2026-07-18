<?php

namespace App\Services\Observability;

use Illuminate\Support\Facades\Cache;

class MetricsService
{
    public function request(string $method, string $path, int $status, float $duration): void
    {
        $key = "metrics:requests:{$method}:{$path}:{$status}";
        $this->increment($key, $duration);
    }

    public function exception(string $type, string $method, string $path): void
    {
        $key = "metrics:exceptions:{$type}:{$method}:{$path}";
        $this->increment($key);
    }

    public function rateLimit(string $client, string $route): void
    {
        $key = "metrics:rate_limit:{$client}:{$route}";
        $this->increment($key);
    }

    public function webhook(string $event, string $status): void
    {
        $key = "metrics:webhooks:{$event}:{$status}";
        $this->increment($key);
    }

    public function capture(\Closure $callback): mixed
    {
        $start = microtime(true);
        $result = $callback();
        $duration = (microtime(true) - $start) * 1000;

        $response = app(\Illuminate\Contracts\Routing\ResponseFactory::class);

        $status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : 200;

        $this->request(request()->getMethod(), request()->path() ?? 'cli', $status, $duration);

        return $result;
    }

    private function increment(string $key, float $value = 0.0): void
    {
        $ttl = (int) config('observability.metrics.retention', 3600);

        $current = (int) Cache::get($key, 0);

        Cache::put($key, $current + $value, $ttl);
    }
}
