<?php

namespace App\Services;

use App\Models\Driver;
use App\Repositories\DriverAvailabilityRepository;

class DriverAvailabilityService
{
    public function __construct(private DriverAvailabilityRepository $availability) {}

    public function findAvailable(float $latitude, float $longitude, float $radiusKm, ?int $excludeDriverId = null): array
    {
        return $this->availability->getAvailableInRadius($latitude, $longitude, $radiusKm, $excludeDriverId);
    }

    public function refreshStatus(string $driverId, string $status, ?float $latitude = null, ?float $longitude = null): void
    {
        $data = array_filter([
            'driver_id' => $driverId,
            'status' => $status,
            'last_latitude' => $latitude,
            'last_longitude' => $longitude,
            'last_seen_at' => now(),
            'active_trips' => $this->countActiveTrips($driverId),
        ], fn ($v) => $v !== null);

        $this->availability->upsert($data);
    }

    private function countActiveTrips(string $driverId): int
    {
        return Driver::where('id', $driverId)
            ->whereHas('orders', fn ($q) => $q->whereIn('status', ['accepted', 'ongoing']))
            ->count();
    }
}
