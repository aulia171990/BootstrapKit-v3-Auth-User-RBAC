<?php

namespace Tests\Feature\Trip;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\User;
use App\Repositories\TripRepository;
use App\Repositories\TripHistoryRepository;
use App\Services\Trip\TripLifecycleService;
use App\Services\Trip\TripTrackingService;
use App\Services\Trip\TripFareService;
use App\Services\Trip\TripCancellationService;
use App\Services\Trip\TripSOSService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripServiceTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'driver'): User
    {
        return User::factory()->create(['status' => User::STATUS_ACTIVE]);
    }

    private function trip(array $overrides = []): Trip
    {
        return Trip::create(array_merge([
            'trip_code' => 'TRIP-'.uniqid(),
            'status' => Trip::STATUS_CREATED,
            'driver_id' => $this->user()->id,
            'customer_id' => $this->user()->id,
        ], $overrides));
    }

    public function test_lifecycle_start_complete_cancel(): void
    {
        $repo = new TripRepository();
        $history = new TripHistoryRepository();
        $service = new TripLifecycleService($repo, $history);

        $trip = $this->trip(['status' => Trip::STATUS_DRIVER_ARRIVED]);
        $updated = $service->start($trip, $this->user(), new \App\DTOs\Trip\StartTripData());
        $this->assertSame(Trip::STATUS_STARTED, $updated->status);
    }

    public function test_complete_requires_in_progress(): void
    {
        $service = new TripLifecycleService(new TripRepository(), new TripHistoryRepository());
        $trip = $this->trip();

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $service->complete($trip, $this->user(), new \App\DTOs\Trip\CompleteTripData());
    }

    public function test_sos_service_triggers_emergency(): void
    {
        $service = new TripSOSService(new TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_STARTED]);

        $updated = $service->trigger($trip, 'help');

        $this->assertSame(Trip::STATUS_EMERGENCY, $updated->status);
    }

    public function test_tracking_service_records_location(): void
    {
        $trip = $this->trip();
        $service = new TripTrackingService(new \App\Repositories\TripLocationRepository());
        $service->recordLocation($trip, ['latitude' => 10.0, 'longitude' => 20.0]);
        $this->assertDatabaseCount('trip_locations', 1);
    }

    public function test_cancellation_service_blocks_invalid_status(): void
    {
        $service = new TripCancellationService(new TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_COMPLETED]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $service->cancel($trip, 'cancelled');
    }
}
