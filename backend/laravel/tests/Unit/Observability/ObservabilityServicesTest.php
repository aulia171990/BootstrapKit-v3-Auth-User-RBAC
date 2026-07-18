<?php

namespace Tests\Unit\Observability;

use App\Services\Observability\HealthCheckService;
use App\Services\Observability\MetricsService;
use App\Services\Observability\TracingService;
use Tests\TestCase;

class ObservabilityServicesTest extends TestCase
{
    public function test_health_service_database_returns_ok_status(): void
    {
        $service = app(HealthCheckService::class);
        $result = $service->database();

        $this->assertArrayHasKey('database', $result);
        $this->assertSame('ok', $result['database']['status']);
    }

    public function test_health_service_storage_returns_ok_status(): void
    {
        $service = app(HealthCheckService::class);
        $result = $service->storage();

        $this->assertArrayHasKey('storage', $result);
        $this->assertSame('ok', $result['storage']['status']);
    }

    public function test_tracing_service_instrument_request(): void
    {
        $service = app(TracingService::class);
        $traceId = $service->begin('unit-trace');

        $this->assertNotEmpty($traceId);
        $service->record($traceId, ['status' => 200]);
        $service->end($traceId);
    }

    public function test_metrics_service_captures_request_latency(): void
    {
        $service = app(MetricsService::class);
        $memoryBefore = memory_get_usage();
        $service->capture(function () {
            usleep(1000);
        });
        $this->assertGreaterThan($memoryBefore, memory_get_usage());
    }
}
