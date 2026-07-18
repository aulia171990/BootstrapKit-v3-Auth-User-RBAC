<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class StructuredLoggingMiddleware
{
    protected ?float $startedAt = null;

    public function handle(Request $request, Closure $next): Response
    {
        $this->startedAt = microtime(true);

        if (! $request->headers->has('X-Request-ID')) {
            $request->headers->set('X-Request-ID', (string) Str::ulid());
        }

        $response = $next($request);

        $this->logRequest($request, $response);

        return $response;
    }

    protected function logRequest(Request $request, Response $response): void
    {
        $latency = $this->startedAt !== null
            ? round((microtime(true) - $this->startedAt) * 1000, 2)
            : null;

        $user = $request->user();

        logger()->info('request', [
            'request_id' => (string) $request->headers->get('X-Request-ID'),
            'user_id'    => $user?->getKey(),
            'endpoint'   => $request->getMethod().' '.$request->path(),
            'ip'         => $request->ip(),
            'latency'    => $latency,
            'status'     => $response->getStatusCode(),
        ]);
    }
}
