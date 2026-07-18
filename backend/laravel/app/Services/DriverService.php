<?php

namespace App\Services;

use App\Events\DriverApproved;
use App\Events\DriverRejected;
use App\Events\DriverSuspended;
use App\Events\DriverStatusChanged;
use App\Models\Driver;
use App\Repositories\DriverRepository;
use App\Repositories\DriverStatusHistoryRepository;
use App\Repositories\VehicleRepository;
use Illuminate\Support\Collection;

class DriverService
{
    public function __construct(
        private DriverRepository $drivers,
        private DriverStatusHistoryRepository $history,
        private VehicleRepository $vehicles,
    ) {}

    public function registerDriver(array $data, string $userId): Driver
    {
        $driver = $this->drivers->createForUser($userId, $data);

        $this->history->record($driver->id, Driver::STATUS_PENDING, 'Driver mendaftar');

        return $driver;
    }

    public function approve(Driver $driver, ?string $reviewedBy = null): Driver
    {
        $driver = $this->drivers->updateStatus($driver, Driver::STATUS_APPROVED, 'Driver disetujui', $reviewedBy);

        DriverApproved::dispatch($driver);

        return $driver;
    }

    public function reject(Driver $driver, ?string $reviewedBy = null, ?string $note = null): Driver
    {
        $driver = $this->drivers->updateStatus($driver, Driver::STATUS_REJECTED, $note, $reviewedBy);

        DriverRejected::dispatch($driver);

        return $driver;
    }

    public function suspend(Driver $driver, ?string $reviewedBy = null, ?string $note = null): Driver
    {
        $driver = $this->drivers->updateStatus($driver, Driver::STATUS_SUSPENDED, $note ?? 'Driver disuspend', $reviewedBy);

        // Also change operational status to offline if suspended
        if ($driver->status !== Driver::STATUS_OFFLINE) {
            $driver = $this->drivers->updateStatus($driver, Driver::STATUS_OFFLINE);
        }

        DriverSuspended::dispatch($driver);

        return $driver;
    }

    public function goOnline(Driver $driver): Driver
    {
        if ($driver->verification_status !== Driver::STATUS_APPROVED) {
            throw new \InvalidArgumentException('Driver belum disetujui.');
        }

        if ($driver->status === Driver::STATUS_SUSPENDED) {
            throw new \InvalidArgumentException('Driver disuspend dan tidak dapat online.');
        }

        $driver = $this->drivers->updateStatus($driver, Driver::STATUS_ONLINE, 'Driver online');

        DriverStatusChanged::dispatch($driver);

        return $driver;
    }

    public function goOffline(Driver $driver): Driver
    {
        $driver = $this->drivers->updateStatus($driver, Driver::STATUS_OFFLINE, 'Driver offline');

        DriverStatusChanged::dispatch($driver);

        return $driver;
    }

    public function updateProfile(string $userId, array $data): Driver
    {
        $driver = $this->drivers->findByUserId($userId);

        if ($driver) {
            $driver->forceFill($data)->save();

            return $driver->fresh();
        }

        return $this->drivers->createForUser($userId, $data);
    }

    public function cancelTrip(Driver $driver): Driver
    {
        if ($driver->status !== Driver::STATUS_ON_TRIP) {
            throw new \InvalidArgumentException('Driver tidak sedang dalam trip.');
        }

        $driver->forceFill([
            'status' => Driver::STATUS_ONLINE,
        ])->save();

        $this->history->record($driver->id, Driver::STATUS_ONLINE, 'Trip dibatalkan');

        return $driver->fresh();
    }
}
