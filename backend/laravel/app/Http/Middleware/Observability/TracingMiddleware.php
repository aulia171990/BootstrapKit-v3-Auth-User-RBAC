<?php

namespace App\Http\Middleware\Observability;

use App\Services\Observability\ObservabilityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TracingMiddleware
{
    public function __construct(private ObservabilityService $observability) {}

    public function handle(Request $request, Closure $next): Response
    {
        $headers = $request->headers;

        $traceId = $headers->get('X-Trace-ID') ?: (string) \Illuminate\Support\Str::orderedUuid();
        $spanId = $headers->get('X-Span-ID') ?: (string) \Illuminate\Support\Str::orderedUuid();
        $requestId = $headers->get('X-Request-ID') ?: (string) \Illuminate\Support\Str::ulid();

        $request->headers->set('X-Trace-ID', $traceId);
        $request->headers->set('X-Span-ID', $spanId);
        $request->headers->set('X-Request-ID', $requestId);

        $startedAt = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $startedAt) * 1000, 2);

        app(\App\Services\Observability\TracingService::class)->record($traceId, [
            'span_id' => $spanId,
            'request_id' => $requestId,
            'method' => $request->getMethod(),
            'path' => $request->getPathInfo(),
            'status' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'user_id' => optional($request->user())->getKey(),
        ]);

        $response->headers->set('X-Trace-ID', $traceId);
        $response->headers->set('X-Span-ID', $spanId);
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
