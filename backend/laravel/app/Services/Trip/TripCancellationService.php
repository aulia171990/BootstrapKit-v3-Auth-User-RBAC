<?php

namespace App\Services\Trip;

use App\Models\Trip;
use App\Repositories\TripRepository;

class TripCancellationService
{
    public function __construct(private TripRepository $trips) {}

    public function cancel(Trip $trip, ?string $reason = null, array $meta = []): Trip
    {
        if (in_array($trip->status, [Trip::STATUS_COMPLETED, Trip::STATUS_CANCELLED, Trip::STATUS_EMERGENCY], true)) {
            abort(422, 'Trip tidak bisa dibatalkan.');
        }

        return $this->trips->update($trip, [
            'status' => Trip::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);
    }
}
