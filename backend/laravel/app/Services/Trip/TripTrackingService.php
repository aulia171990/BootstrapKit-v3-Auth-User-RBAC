<?php

namespace App\Services\Trip;

use App\Jobs\Trip\TripBroadcastLocationUpdated;
use App\Models\Trip;
use App\Repositories\TripLocationRepository;

class TripTrackingService
{
    public function __construct(private TripLocationRepository $locations) {}

    public function recordLocation(Trip $trip, array $payload): void
    {
        $this->locations->create(array_merge($payload, [
            'trip_id' => $trip->id,
        ]));

        TripBroadcastLocationUpdated::dispatch($trip, $payload);
    }
}
