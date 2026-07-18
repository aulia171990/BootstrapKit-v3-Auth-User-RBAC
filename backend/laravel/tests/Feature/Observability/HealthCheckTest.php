<?php

namespace Tests\Feature\Observability;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->get('/api/v1/health');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'OK');
    }

    public function test_ready_endpoint_returns_payload(): void
    {
        $response = $this->get('/api/v1/ready');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Ready');
    }

    public function test_live_endpoint_returns_payload(): void
    {
        $response = $this->get('/api/v1/live');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Live');
    }
}
