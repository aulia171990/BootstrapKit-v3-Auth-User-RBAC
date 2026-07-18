<?php

namespace Tests\Feature\Trip;

use App\Jobs\Trip\TripBroadcastLocationUpdated;
use App\Jobs\Trip\TripBroadcastStatusChanged;
use App\Models\Trip;
use App\Models\User;
use App\Services\Trip\TripLifecycleService;
use App\Services\Trip\TripSOSService;
use App\Services\Trip\TripTrackingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TripRealtimeIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
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

    public function test_start_dispatches_status_changed_job(): void
    {
        Queue::fake();

        $service = new TripLifecycleService(new \App\Repositories\TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_DRIVER_ARRIVED]);

        $service->start($trip, $this->user(), new \App\DTOs\Trip\StartTripData());

        Queue::assertPushed(TripBroadcastStatusChanged::class, function ($job) use ($trip) {
            return $job->event === 'trip.started' && $job->trip->id === $trip->id;
        });
    }

    public function test_complete_dispatches_status_changed_job(): void
    {
        Queue::fake();

        $service = new TripLifecycleService(new \App\Repositories\TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_IN_PROGRESS]);

        $service->complete($trip, $this->user(), new \App\DTOs\Trip\CompleteTripData());

        Queue::assertPushed(TripBroadcastStatusChanged::class, function ($job) {
            return $job->event === 'trip.completed';
        });
    }

    public function test_cancel_dispatches_status_changed_job_with_reason(): void
    {
        Queue::fake();

        $service = new TripLifecycleService(new \App\Repositories\TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_STARTED]);

        $service->cancel($trip, $this->user(), new \App\DTOs\Trip\CancelTripData('customer_cancel'));

        Queue::assertPushed(TripBroadcastStatusChanged::class, function ($job) {
            return $job->event === 'trip.cancelled' && $job->reason === 'customer_cancel';
        });
    }

    public function test_sos_dispatches_status_changed_job(): void
    {
        Queue::fake();

        $service = new TripSOSService(new \App\Repositories\TripRepository());
        $trip = $this->trip(['status' => Trip::STATUS_STARTED]);

        $service->trigger($trip, 'help');

        Queue::assertPushed(TripBroadcastStatusChanged::class, function ($job) {
            return $job->event === 'trip.sos';
        });
    }

    public function test_tracking_dispatches_location_updated_job(): void
    {
        Queue::fake();

        $trip = $this->trip();
        $service = new TripTrackingService(new \App\Repositories\TripLocationRepository());

        $service->recordLocation($trip, ['latitude' => 10.0, 'longitude' => 20.0]);

        Queue::assertPushed(TripBroadcastLocationUpdated::class, function ($job) use ($trip) {
            return $job->trip->id === $trip->id && $job->payload['latitude'] === 10.0;
        });
    }
}
