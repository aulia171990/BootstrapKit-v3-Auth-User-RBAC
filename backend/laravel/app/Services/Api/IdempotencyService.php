<?php

namespace App\Services\Api;

use Illuminate\Contracts\Cache\Repository as Cache;
use App\Exceptions\Api\ApiGatewayException;

class IdempotencyService
{
    public function __construct(private Cache $cache) {}

    public function ensure(string $key, callable $action, ?int $ttlSeconds = null)
    {
        $ttl = $ttlSeconds ?? 300;

        $cached = $this->cache->get($this->buildKey($key));

        if ($cached !== null) {
            return $cached;
        }

        $result = $action();

        $this->cache->put($this->buildKey($key), $result, now()->addSeconds($ttl));

        return $result;
    }

    public function invalidate(string $key): void
    {
        $this->cache->forget($this->buildKey($key));
    }

    private function buildKey(string $key): string
    {
        return 'api_idempotency:' . $key;
    }
}
