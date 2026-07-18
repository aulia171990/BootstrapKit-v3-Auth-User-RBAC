<?php

namespace App\Services;

use App\Models\Driver;
use App\Repositories\DriverDocumentRepository;
use App\Repositories\DriverRepository;
use App\Repositories\LocationRepository;
use Illuminate\Http\Request;

class DriverLocationService
{
    public function __construct(
        private DriverRepository $drivers,
        private DriverDocumentRepository $documents,
        private LocationRepository $locations,
    ) {}

    public function recordLocation(string $driverId, float $lat, float $lng): void
    {
        $driver = $this->drivers->findOrFail($driverId);

        if ($driver->verification_status !== Driver::STATUS_APPROVED) {
            throw new \InvalidArgumentException('Driver belum disetujui.');
        }

        $this->locations->recordDriverLocation($driverId, $lat, $lng);

        $driver->forceFill([
            'latitude' => $lat,
            'longitude' => $lng,
            'last_online_at' => now(),
        ])->save();
    }
}
