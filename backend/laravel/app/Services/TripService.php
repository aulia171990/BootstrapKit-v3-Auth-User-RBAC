<?php

namespace App\Services;

use App\Events\TripStarted;
use App\Events\TripPaused;
use App\Events\TripResumed;
use App\Events\TripCompleted;
use App\Events\TripCancelled;
use App\Events\TripSOSActivated;
use App\Events\DriverArrived;
use App\Events\PassengerPickedUp;
use App\Models\AuditLog;
use App\Models\DispatchJob;
use App\Models\Trip;
use App\Models\User;
use App\Notifications\TripStarted as TripStartedNotification;
use App\Notifications\TripUpdated;
use Illuminate\Support\Facades\Auth;

class TripService
{
    public function __construct(
        public TripRepository $trips,
        public TripHistoryRepository $history,
    ) {}

    public function create(Trip $trip): Trip
    {
        $job = $trip->dispatch_job_id
            ? DispatchJob::find($trip->dispatch_job_id)
            : null;

        if ($job && $job->status !== DispatchJob::STATUS_ASSIGNED) {
            abort(422, 'Dispatch belum menugaskan driver.');
        }

        $trip->trip_code = $this->generateTripCode();
        $this->trips->create($trip->toArray());

        $this->history->create([
            'trip_id' => $trip->id,
            'from_status' => null,
            'to_status' => Trip::STATUS_CREATED,
            'actor_type' => 'system',
            'actor_id' => null,
            'occurred_at' => now(),
        ]);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $trip);

        TripStarted::dispatch($trip);

        return $trip;
    }

    public function start(Trip $trip, User $actor): Trip
    {
        if ($trip->status !== Trip::STATUS_DRIVER_ARRIVED && $trip->status !== Trip::STATUS_PASSENGER_BOARDING) {
            abort(422, 'Trip belum bisa dimulai.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_STARTED,
            'started_at' => now(),
        ]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_STARTED,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        $this->notify($updated->customer_id, new TripStartedNotification($updated));

        TripStarted::dispatch($updated);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $updated);

        return $updated;
    }

    public function complete(Trip $trip, User $actor): Trip
    {
        if ($trip->status !== Trip::STATUS_IN_PROGRESS && $trip->status !== Trip::STATUS_WAITING) {
            abort(422, 'Trip belum bisa diselesaikan.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_COMPLETED,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        TripCompleted::dispatch($updated);

        $this->recordAudit(AuditLog::ACTION_DRIVER_ASSIGNED, $updated);

        return $updated;
    }

    public function cancel(Trip $trip, User $actor, ?string $reason = null): Trip
    {
        if (in_array($trip->status, [Trip::STATUS_COMPLETED, Trip::STATUS_CANCELLED, Trip::STATUS_EMERGENCY], true)) {
            abort(422, 'Trip tidak bisa dibatalkan.');
        }

        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_CANCELLED,
            'actor_type' => $actor->roles()->first()?->name ?? 'system',
            'actor_id' => $actor->id,
            'notes' => $reason,
            'occurred_at' => now(),
        ]);

        TripCancelled::dispatch($updated, $reason);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_FAILED, $updated);

        return $updated;
    }

    public function arrive(Trip $trip, User $actor): Trip
    {
        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_DRIVER_ARRIVED,
            'arrived_at' => now(),
        ]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_DRIVER_ARRIVED,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        DriverArrived::dispatch($updated);

        $this->notify($updated->customer_id, new TripUpdated($updated, 'Driver arrived'));

        $this->recordAudit(AuditLog::ACTION_DRIVER_OFFER_SENT, $updated);

        return $updated;
    }

    public function pickup(Trip $trip, User $actor): Trip
    {
        $updated = $this->trips->update($trip, [
            'status' => Trip::STATUS_PASSENGER_BOARDING,
            'picked_up_at' => now(),
        ]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_PASSENGER_BOARDING,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        PassengerPickedUp::dispatch($updated);

        $this->recordAudit(AuditLog::ACTION_DRIVER_ASSIGNED, $updated);

        return $updated;
    }

    public function pause(Trip $trip, User $actor): Trip
    {
        if ($trip->status !== Trip::STATUS_IN_PROGRESS) {
            abort(422, 'Trip tidak sedang berjalan.');
        }

        $updated = $this->trips->update($trip, ['status' => Trip::STATUS_WAITING]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_WAITING,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        TripPaused::dispatch($updated);
        $this->recordAudit(AuditLog::ACTION_DISPATCH_FAILED, $updated);

        return $updated;
    }

    public function resume(Trip $trip, User $actor): Trip
    {
        if ($trip->status !== Trip::STATUS_WAITING) {
            abort(422, 'Trip tidak dalam status menunggu.');
        }

        $updated = $this->trips->update($trip, ['status' => Trip::STATUS_IN_PROGRESS]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_IN_PROGRESS,
            'actor_type' => $actor->roles()->first()?->name ?? 'driver',
            'actor_id' => $actor->id,
            'occurred_at' => now(),
        ]);

        TripResumed::dispatch($updated);
        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $updated);

        return $updated;
    }

    public function sos(Trip $trip, User $actor, ?string $note = null): Trip
    {
        $updated = $this->trips->update($trip, ['status' => Trip::STATUS_EMERGENCY]);

        $this->history->create([
            'trip_id' => $updated->id,
            'from_status' => $trip->status,
            'to_status' => Trip::STATUS_EMERGENCY,
            'actor_type' => $actor->roles()->first()?->name ?? 'user',
            'actor_id' => $actor->id,
            'notes' => $note,
            'occurred_at' => now(),
        ]);

        TripSOSActivated::dispatch($updated, $actor);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_FAILED, $updated);

        return $updated;
    }

    private function generateTripCode(): string
    {
        return 'TRIP-'.strtoupper(uniqid());
    }

    private function recordAudit(string $action, Trip $trip): void
    {
        if (! Auth::check()) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'ip_address' => request()->ip(),
            'actor_email' => Auth::user()?->email,
            'context' => ['trip_id' => $trip->id, 'trip_code' => $trip->trip_code],
        ]);
    }

    private function notify(string $userId, $notification): void
    {
        // Replace with notification bus when available.
    }
}