<?php

namespace Tests\Feature\Trip;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_authorization(): void
    {
        $response = $this->getJson('/api/v1/trips');

        $response->assertStatus(401);
    }
}
