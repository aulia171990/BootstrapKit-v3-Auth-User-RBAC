<?php

namespace App\Repositories;

use App\Models\BookingStop;
use App\Models\DriverLocation;

class LocationRepository
{
    public function upsertBookingStops(string $bookingId, array $stops): void
    {
        foreach ($stops as $stop) {
            BookingStop::create(array_merge($stop, ['booking_id' => $bookingId]));
        }
    }

    public function recordDriverLocation(string $driverId, float $lat, float $lng): DriverLocation
    {
        return DriverLocation::create([
            'driver_id' => $driverId,
            'latitude' => $lat,
            'longitude' => $lng,
            'recorded_at' => now(),
        ]);
    }
}
