<?php

namespace Tests\Feature\Analytics;

use App\Models\User;
use App\Services\Analytics\AnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/api/v1/analytics/dashboard');
        $response->assertStatus(401);
    }

    public function test_service_dashboard_returns_kpi_and_reports(): void
    {
        $service = app(AnalyticsService::class);
        $dashboard = $service->dashboard();

        $this->assertArrayHasKey('kpi', $dashboard);
        $this->assertArrayHasKey('reports', $dashboard);
        $this->assertArrayHasKey('trips', $dashboard['reports']);
    }
}
