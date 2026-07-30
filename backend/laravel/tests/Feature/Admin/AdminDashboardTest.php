<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\Admin\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

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
        $token = JWTAuth::fromUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/dashboard/stats')
            ->assertStatus(403);

        $admin = User::where('email', 'admin@ojol.test')->first();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/dashboard/stats')
            ->assertStatus(200);
    }
}
