<?php

namespace App\Services\Trip;

use App\Models\Trip;
use App\Repositories\TripRepository;

class TripFareService
{
    public function __construct(private TripRepository $trips) {}

    public function updateFare(Trip $trip, ?float $finalFare, ?float $actualDistance, ?int $actualDuration): Trip
    {
        return $this->trips->update($trip, [
            'final_fare' => $finalFare,
            'actual_distance' => $actualDistance,
            'actual_duration' => $actualDuration,
        ]);
    }
}
