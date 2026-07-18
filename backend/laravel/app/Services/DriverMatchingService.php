<?php

namespace App\Services;

use App\Jobs\SendDriverOffer;
use App\Services\Strategies\DispatchStrategyInterface;
use App\Repositories\DispatchRepository;
use App\Repositories\DispatchCandidateRepository;

class DriverMatchingService
{
    public function __construct(
        private DispatchRepository $dispatches,
        private DispatchCandidateRepository $candidates,
        private DispatchScoringService $scoring,
    ) {}

    /**
     * @param array<int, array<string, mixed>> $candidates
     * @return array<int, array<string, mixed>>|null
     */
    public function select(string $dispatchJobId, array $candidates): ?array
    {
        $job = $this->dispatches->findOrFail($dispatchJobId);

        $strategyClass = config('dispatch.strategies.'.config('dispatch.strategy', 'highest_score'));

        if ($strategyClass && class_exists($strategyClass)) {
            $strategy = new $strategyClass($this->scoring);
            if ($strategy instanceof DispatchStrategyInterface) {
                $candidates = $strategy->rank($dispatchJobId, $candidates);
            }
        }

        $candidates = array_values(array_filter($candidates, fn ($c) => $c['driver_id'] !== null));

        $job = $this->dispatches->update($job, [
            'current_attempt' => ($job->current_attempt ?? 0) + 1,
        ]);

        $selected = $candidates[0] ?? null;

        if ($selected) {
            SendDriverOffer::dispatch($dispatchJobId, $selected['driver_id']);
        }

        return $selected;
    }
}
