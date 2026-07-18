<?php

namespace App\Repositories;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\DriverVehicleAssignment;
use App\Models\DriverStatusHistory;

class DriverRepository
{
    public function findOrFail(string $id): Driver
    {
        return Driver::findOrFail($id);
    }

    public function findByUserId(string $userId): ?Driver
    {
        return Driver::where('user_id', $userId)->first();
    }

    public function createForUser(string $userId, array $data): Driver
    {
        return Driver::create(array_merge($data, [
            'user_id' => $userId,
            'status' => Driver::STATUS_OFFLINE,
            'verification_status' => Driver::STATUS_PENDING,
        ]));
    }

    public function updateStatus(Driver $driver, string $status, ?string $note = null, ?string $reviewedBy = null): Driver
    {
        $driver->forceFill([
            'status' => $status,
            'online_status' => $status,
            'last_online_at' => $status === Driver::STATUS_ONLINE ? now() : $driver->last_online_at,
        ])->save();

        if (in_array($status, [
            Driver::STATUS_PENDING,
            Driver::STATUS_REJECTED,
            Driver::STATUS_APPROVED,
            Driver::STATUS_SUSPENDED,
        ], true)) {
            $driver->verification_status = $status;
            $driver->save();

            DriverStatusHistory::create([
                'driver_id' => $driver->id,
                'status' => $status,
                'note' => $note,
                'reviewed_by' => $reviewedBy,
                'reviewed_at' => now(),
            ]);
        }

        return $driver->fresh();
    }

    public function completeTrip(Driver $driver): Driver
    {
        $driver->forceFill([
            'status' => Driver::STATUS_ONLINE,
            'online_status' => Driver::STATUS_ONLINE,
            'completed_trips' => ($driver->completed_trips ?? 0) + 1,
        ])->save();

        return $driver->fresh();
    }
}
