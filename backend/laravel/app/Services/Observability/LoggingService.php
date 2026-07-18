<?php

namespace App\Services\Observability;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LoggingService
{
    public function logRequest(Request $request, ?\Closure $next = null): void
    {
        $traceId = (string) $request->headers->get('X-Trace-ID', \Illuminate\Support\Str::orderedUuid());
        $request->headers->set('X-Trace-ID', $traceId);

        $log = [
            'request_id' => (string) $request->headers->get('X-Request-ID'),
            'trace_id' => $traceId,
            'user_id' => optional($request->user())->getKey(),
            'trip_id' => optional($request->user())->driver?->active_trip_id ?? $request->headers->get('X-Trip-ID'),
            'driver_id' => optional($request->user())->driver?->id ?? $request->headers->get('X-Driver-ID'),
            'booking_id' => $request->headers->get('X-Booking-ID'),
            'endpoint' => $request->getMethod().' '.$request->path(),
            'ip' => $request->ip(),
            'duration_ms' => null,
            'status_code' => null,
        ];

        if (! $next) {
            Log::channel('stack')->info('observability.request', $log);

            return;
        }

        $start = microtime(true);
        $response = $next($request);
        $log['duration_ms'] = round((microtime(true) - $start) * 1000, 2);
        $log['status_code'] = $response->getStatusCode();

        Log::channel('stack')->info('observability.request', $log);
    }

    public function redact(array $payload): array
    {
        foreach (['password', 'password_confirmation', 'token', 'access_token', 'refresh_token', 'secret', 'api_key'] as $field) {
            if (array_key_exists($field, $payload)) {
                $payload[$field] = '***';
            }
        }

        return $payload;
    }
}
