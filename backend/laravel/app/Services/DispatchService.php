<?php

namespace App\Services;

use App\Events\DispatchCompleted;
use App\Events\DispatchFailed;
use App\Events\DispatchStarted;
use App\Models\Booking;
use App\Repositories\DispatchRepository;

class DispatchService
{
    public function __construct(private DispatchRepository $dispatches) {}

    public function start(Booking $booking, array $context = []): \App\Models\DispatchJob
    {
        $useQueue = config('dispatch.use_queue', true);

        $job = $this->dispatches->create([
            'booking_id' => $booking->id,
            'status' => \App\Models\DispatchJob::STATUS_SEARCHING,
            'strategy' => config('dispatch.strategy', 'highest_score'),
            'search_radius' => config('dispatch.search_radius_km', 5),
            'max_attempts' => config('dispatch.max_attempts', 5),
            'current_attempt' => 0,
            'started_at' => now(),
            'context' => $context,
        ]);

        if ($useQueue) {
            \App\Jobs\StartDispatchJob::dispatch($job->id, $context ?? []);
        }

        DispatchStarted::dispatch($job);

        return $job;
    }

    public function complete(string $id): \App\Models\DispatchJob
    {
        $job = $this->dispatches->findOrFail($id);

        $job = $this->dispatches->update($job, [
            'status' => \App\Models\DispatchJob::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        DispatchCompleted::dispatch($job);

        return $job;
    }

    public function fail(string $id, string $reason = ''): \App\Models\DispatchJob
    {
        $job = $this->dispatches->findOrFail($id);

        $job = $this->dispatches->update($job, [
            'status' => \App\Models\DispatchJob::STATUS_FAILED,
            'failed_at' => now(),
        ]);

        DispatchFailed::dispatch($job, $reason);

        return $job;
    }
}
