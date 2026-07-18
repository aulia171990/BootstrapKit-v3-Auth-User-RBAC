<?php

namespace Tests\Feature\Analytics;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_unauthorized_for_export(): void
    {
        $response = $this->get('/api/v1/analytics/export?type=trips');
        $response->assertStatus(401);
    }
}
