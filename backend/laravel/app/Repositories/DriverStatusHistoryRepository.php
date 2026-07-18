<?php

namespace App\Repositories;

use App\Models\DriverStatusHistory;

class DriverStatusHistoryRepository
{
    public function record(string $driverId, string $status, ?string $note = null, ?string $reviewedBy = null): DriverStatusHistory
    {
        return DriverStatusHistory::create([
            'driver_id' => $driverId,
            'status' => $status,
            'note' => $note,
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ]);
    }

    public function forDriver(string $driverId): array
    {
        return DriverStatusHistory::where('driver_id', $driverId)
            ->orderByDesc('created_at')
            ->get()
            ->all();
    }
}
