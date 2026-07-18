<?php

namespace Tests\Feature\Trip;

use App\Models\Trip;
use App\Models\User;
use App\Services\Trip\TripLifecycleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_trip_actions_require_valid_actor(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $trip = Trip::create([
            'trip_code' => 'TRIP-'.uniqid(),
            'status' => Trip::STATUS_DRIVER_ARRIVED,
            'driver_id' => $user->id,
            'customer_id' => $user->id,
        ]);

        $service = new TripLifecycleService(new \App\Repositories\TripRepository(), new \App\Repositories\TripHistoryRepository());
        $updated = $service->start($trip, $user, new \App\DTOs\Trip\StartTripData());

        $this->assertSame(Trip::STATUS_STARTED, $updated->status);
        $this->assertNotNull($updated->started_at);
    }
}
