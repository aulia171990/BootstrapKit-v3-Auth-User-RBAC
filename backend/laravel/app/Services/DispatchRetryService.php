<?php

namespace App\Services;

use App\Jobs\SendDriverOffer;
use App\Repositories\DispatchCandidateRepository;
use App\Repositories\DispatchRepository;

class DispatchRetryService
{
    public function __construct(
        private DispatchRepository $dispatches,
        private DispatchCandidateRepository $candidates,
        private DriverMatchingService $matcher,
    ) {}

    public function recordResponse(string $dispatchJobId, string $driverId, string $response): void
    {
        $job = $this->dispatches->findOrFail($dispatchJobId);

        $top = $this->candidates->getTop($dispatchJobId, 1);

        if (! empty($top) && ($top[0]->driver_id ?? null) === $driverId) {
            if ($response === 'accepted') {
                $this->dispatches->update($job, [
                    'status' => \App\Models\DispatchJob::STATUS_ASSIGNED,
                    'completed_at' => now(),
                ]);

                return;
            }

            $this->tryNextCandidate($dispatchJobId);
        }
    }

    public function retry(string $dispatchJobId): void
    {
        $this->tryNextCandidate($dispatchJobId);
    }

    private function tryNextCandidate(string $dispatchJobId): void
    {
        $job = $this->dispatches->findOrFail($dispatchJobId);

        $remaining = $this->candidates->getTop($dispatchJobId, 5);

        $next = array_values(array_filter($remaining, fn ($c) => $c->response === null))[0] ?? null;

        if ($next) {
            SendDriverOffer::dispatch($dispatchJobId, $next->driver_id);
            return;
        }

        $this->dispatches->update($job, [
            'status' => \App\Models\DispatchJob::STATUS_FAILED,
            'failed_at' => now(),
        ]);
    }
}
