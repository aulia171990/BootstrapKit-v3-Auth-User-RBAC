<?php

namespace App\Services\Api;

use App\Exceptions\Api\ApiGatewayException;
use Illuminate\Contracts\Cache\Repository as Cache;

class RateLimitService
{
    public function __construct(private Cache $cache) {}

    public function allow(string $key, int $limit, int $windowSeconds = 60): bool
    {
        $hits = $this->cache->get($this->buildKey($key, 'hits'), 0);
        $resetAt = $this->cache->get($this->buildKey($key, 'reset_at'));

        if ($resetAt && now()->greaterThanOrEqualTo($resetAt)) {
            $this->cache->forget($this->buildKey($key, 'hits'));
            $hits = 0;
        }

        if ($hits >= $limit) {
            throw ApiGatewayException::rateLimitExceeded();
        }

        $this->cache->increment($this->buildKey($key, 'hits'));

        if (! $resetAt) {
            $this->cache->put($this->buildKey($key, 'reset_at'), now()->addSeconds($windowSeconds), now()->addSeconds($windowSeconds));
        }

        return true;
    }

    private function buildKey(string $key, string $suffix): string
    {
        return 'api_rate_limit:' . $key . ':' . $suffix;
    }
}
