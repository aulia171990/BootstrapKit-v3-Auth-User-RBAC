<?php

namespace Tests\Feature\Driver;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverLocationFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function tokenForDriver(Driver $driver): string
    {
        return $this->postJson('/api/v1/auth/login', [
            'email' => $driver->user->email,
            'password' => 'password',
        ])->json('data.token');
    }

    public function test_approved_driver_can_update_location(): void
    {
        $driver = Driver::create([
            'user_id' => User::factory()->create()->id,
            'verification_status' => Driver::STATUS_APPROVED,
        ]);

        $this->postJson('/api/v1/drivers/' . $driver->id . '/online');

        $this->withHeader('Authorization', 'Bearer ' . $this->tokenForDriver($driver))
            ->postJson('/api/v1/drivers/location', [
                'lat' => -6.2,
                'lng' => 106.8,
                'heading' => 90,
                'speed' => 12,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.latitude', -6.2)
            ->assertJsonPath('data.longitude', 106.8);
    }

    public function test_nearby_requires_valid_coordinates(): void
    {
        $approved = Driver::create([
            'user_id' => User::factory()->create()->id,
            'verification_status' => Driver::STATUS_APPROVED,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->tokenForDriver($approved))
            ->getJson('/api/v1/drivers/nearby?lat=invalid&lng=invalid&radius=5')
            ->assertStatus(422);
    }
}
