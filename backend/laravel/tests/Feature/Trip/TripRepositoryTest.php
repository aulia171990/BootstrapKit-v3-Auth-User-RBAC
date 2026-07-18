<?php

namespace Tests\Feature\Trip;

use App\Models\Trip;
use App\Repositories\TripRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_repository_can_create_and_find_trip(): void
    {
        $repo = new TripRepository();

        $trip = $repo->create([
            'trip_code' => 'TRIP-'.uniqid(),
            'status' => Trip::STATUS_CREATED,
            'driver_id' => '00000000-0000-0000-0000-000000000001',
            'customer_id' => '00000000-0000-0000-0000-000000000002',
        ]);

        $this->assertNotNull($trip->id);

        $found = $repo->findOrFail($trip->id);
        $this->assertSame($trip->id, $found->id);
    }
}
