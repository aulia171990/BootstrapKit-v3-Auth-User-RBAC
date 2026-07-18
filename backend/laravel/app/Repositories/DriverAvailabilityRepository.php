<?php

namespace App\Repositories;

use App\Models\DriverAvailability;

class DriverAvailabilityRepository
{
    public function getAvailableInRadius(float $latitude, float $longitude, float $radiusKm, int $excludeDriverId = null): array
    {
        $q = DriverAvailability::query()
            ->join('drivers', 'drivers.id', '=', 'driver_availability.driver_id')
            ->where('driver_availability.status', 'available')
            ->where('drivers.verification_status', 'approved')
            ->where('drivers.status', 'online');

        if ($excludeDriverId) {
            $q->where('driver_availability.driver_id', '!=', $excludeDriverId);
        }

        $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(last_latitude)) * cos(radians(last_longitude) - radians(?)) + sin(radians(?)) * sin(radians(last_latitude))))";

        $results = $q->selectRaw("driver_availability.*, $haversine as distance", [$latitude, $longitude, $latitude])
            ->having('distance', '<=', $radiusKm)
            ->get()
            ->all();

        return $results;
    }

    public function findByDriverId(string $driverId): ?DriverAvailability
    {
        return DriverAvailability::where('driver_id', $driverId)->first();
    }

    public function upsert(array $data): DriverAvailability
    {
        return DriverAvailability::updateOrCreate(['driver_id' => $data['driver_id']], $data);
    }
}
