<?php

namespace App\Repositories;

use App\Models\DriverVehicleAssignment;

class VehicleRepository
{
    public function findOrFail(string $id): DriverVehicleAssignment
    {
        return DriverVehicleAssignment::findOrFail($id);
    }

    public function createForDriver(string $driverId, array $data): DriverVehicleAssignment
    {
        return DriverVehicleAssignment::create(array_merge($data, [
            'driver_id' => $driverId,
            'verification_status' => 'pending',
            'is_primary' => true,
        ]));
    }

    public function updateVerification(string $id, string $status, ?string $reviewedBy = null): DriverVehicleAssignment
    {
        $vehicle = $this->findOrFail($id);
        $vehicle->forceFill([
            'verification_status' => $status,
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ])->save();

        return $vehicle->fresh();
    }
}
