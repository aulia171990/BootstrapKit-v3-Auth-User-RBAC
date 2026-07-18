<?php

namespace App\Services\Trip;

use App\DTOs\Trip\CancelTripData;
use App\DTOs\Trip\CompleteTripData;
use App\DTOs\Trip\CreateTripData;
use App\DTOs\Trip\StartTripData;
use App\Jobs\Trip\TripBroadcastLocationUpdated;
use App\Jobs\Trip\TripBroadcastStatusChanged;
use App\Models\Trip;
use App\Models\User;
use App\Repositories\TripRepository;

class TripLifecycleService
{
    public function __construct(
        private TripRepository $trips,
    ) {}

    public function createFromDTO(CreateTripData $data): Trip
    {
        $trip = $this->trips->create([
            ...$data->toArray(),
            'status' => Trip::STATUS_CREATED,
        ]);

        TripBroadcastStatusChanged::dispatch($trip, 'trip.created');

        return $trip;
    }

    public function start(Trip $trip, User $actor, StartTripData $dto): Trip
    {
        if ($trip->status !== Trip::STATUS_DRIVER_ARRIVED && $trip->status !== Trip::STATUS_PASSENGER_BOARDING) {
            abort(422, 'Trip belum bisa dimulai.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_STARTED,
            'started_at' => now(),
        ]);

        TripBroadcastStatusChanged::dispatch($updated, 'trip.started');

        return $updated;
    }

    public function complete(Trip $trip, User $actor, CompleteTripData $dto): Trip
    {
        if ($trip->status !== Trip::STATUS_IN_PROGRESS && $trip->status !== Trip::STATUS_WAITING) {
            abort(422, 'Trip belum bisa diselesaikan.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_COMPLETED,
            'completed_at' => now(),
            'actual_distance' => $dto->actualDistance,
            'actual_duration' => $dto->actualDuration,
            'final_fare' => $dto->finalFare,
        ]);

        TripBroadcastStatusChanged::dispatch($updated, 'trip.completed');

        return $updated;
    }

    public function cancel(Trip $trip, User $actor, CancelTripData $dto): Trip
    {
        if (in_array($trip->status, [Trip::STATUS_COMPLETED, Trip::STATUS_CANCELLED, Trip::STATUS_EMERGENCY], true)) {
            abort(422, 'Trip tidak bisa dibatalkan.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        TripBroadcastStatusChanged::dispatch($updated, 'trip.cancelled', $dto->reason);

        return $updated;
    }
}
