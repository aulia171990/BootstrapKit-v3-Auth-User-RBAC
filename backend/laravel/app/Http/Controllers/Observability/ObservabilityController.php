<?php

namespace App\Http\Controllers\Observability;

use App\Services\Observability\ObservabilityService;
use App\Services\Observability\HealthCheckService;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class ObservabilityController
{
    public function __construct(
        private ObservabilityService $observability,
        private HealthCheckService $health,
    ) {}

    public function snapshot(Request $request): \Illuminate\Http\JsonResponse
    {
        $traceId = $this->observability->startTrace('observability.snapshot');

        try {
            $data = $this->observability->snapshot();

            return ApiResponse::success($data, 'OK');
        } finally {
            $this->observability->finishTrace($traceId);
        }
    }

    public function metrics(Request $request): \Illuminate\Http\JsonResponse
    {
        $metrics = [
            'requests' => $this->observability->snapshot()['metrics']['requests'] ?? 0,
            'exceptions' => $this->observability->snapshot()['metrics']['exceptions'] ?? 0,
            'rate_limits' => $this->observability->snapshot()['metrics']['rate_limits'] ?? 0,
            'webhooks' => $this->observability->snapshot()['metrics']['webhooks'] ?? 0,
        ];

        return ApiResponse::success($metrics, 'Metrics');
    }

    public function health(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = [
            'app' => 'OK',
            'database' => $this->health->database(),
            'cache' => $this->health->cache(),
            'queue' => $this->health->queue(),
            'storage' => $this->health->storage(),
        ];

        return ApiResponse::success($data, 'OK');
    }

    public function ready(Request $request): \Illuminate\Http\JsonResponse
    {
        return ApiResponse::success(['ready' => true], 'Ready');
    }

    public function live(Request $request): \Illuminate\Http\JsonResponse
    {
        return ApiResponse::success(['live' => true], 'Live');
    }
}
