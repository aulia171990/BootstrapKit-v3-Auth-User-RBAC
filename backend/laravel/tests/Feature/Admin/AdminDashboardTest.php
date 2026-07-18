<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\Admin\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_returns_expected_keys(): void
    {
        $service = app(DashboardService::class);
        $stats = $service->stats();

        $this->assertArrayHasKey('today_trips', $stats);
        $this->assertArrayHasKey('online_drivers', $stats);
        $this->assertArrayHasKey('active_trips', $stats);
        $this->assertArrayHasKey('completed_trips', $stats);
        $this->assertArrayHasKey('cancelled_trips', $stats);
        $this->assertArrayHasKey('revenue_summary', $stats);
        $this->assertArrayHasKey('pending_payments', $stats);
    }

    public function test_dashboard_alerts_returns_array(): void
    {
        $service = app(DashboardService::class);
        $alerts = $service->recentAlerts();

        $this->assertIsArray($alerts);
    }

    public function test_dashboard_health_returns_app_and_db_status(): void
    {
        $service = app(DashboardService::class);
        $health = $service->health();

        $this->assertSame('OK', $health['app']);
        $this->assertNotEmpty($health['db']);
    }

    public function test_admin_dashboard_endpoints_are_registered(): void
    {
        $user = User::factory()->create(['email_verified' => true]);

        $response = $this->actingAs($user)->get('/api/v1/admin/dashboard/stats');
        $response->assertStatus(403);

        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(\App\Models\Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/admin/dashboard/stats');
        $response->assertStatus(200);
    }
}
