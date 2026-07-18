<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\DriverVehicleAssignment;
use App\Repositories\DriverDocumentRepository;
use App\Repositories\DriverRepository;
use App\Repositories\VehicleRepository;

class VehicleAssignmentService
{
    public function __construct(
        private VehicleRepository $vehicles,
        private DriverRepository $drivers,
        private DriverDocumentRepository $documents,
    ) {}

    public function assignPrimary(string $driverId, array $vehicleData): DriverVehicleAssignment
    {
        $driver = $this->drivers->findOrFail($driverId);

        if (! in_array($vehicleData['vehicle_type'] ?? $driver->vehicle_type, ['motorcycle', 'car', 'electric_vehicle'], true)) {
            throw new \InvalidArgumentException('Invalid vehicle type.');
        }

        if (! empty($vehicleData['plate_number'])) {
            $exists = DriverVehicleAssignment::where('driver_id', $driverId)
                ->where('plate_number', $vehicleData['plate_number'])
                ->where('id', '!=', $vehicleData['id'] ?? null)
                ->exists();

            if ($exists) {
                throw new \InvalidArgumentException('Vehicle already assigned to this driver.');
            }
        }

        return $this->vehicles->createForDriver($driverId, $vehicleData);
    }
}
