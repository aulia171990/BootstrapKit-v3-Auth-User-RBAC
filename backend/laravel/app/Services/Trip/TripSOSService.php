<?php

namespace App\Services\Trip;

use App\Jobs\Trip\TripBroadcastStatusChanged;
use App\Models\Trip;
use App\Repositories\TripRepository;

class TripSOSService
{
    public function __construct(private TripRepository $trips) {}

    public function trigger(Trip $trip, ?string $note = null): Trip
    {
        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_EMERGENCY,
        ]);

        TripBroadcastStatusChanged::dispatch($updated, 'trip.sos');

        return $updated;
    }
}
