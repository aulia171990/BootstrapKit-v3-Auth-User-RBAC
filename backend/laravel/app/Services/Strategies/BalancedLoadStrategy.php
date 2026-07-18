<?php

namespace App\Services\Strategies;

use App\Models\DispatchCandidate;
use App\Repositories\AssignmentRepository;
use App\Services\DispatchScoringService;

class BalancedLoadStrategy
{
    public function __construct(
        private DispatchScoringService $scoring,
        private AssignmentRepository $assignments,
    ) {}

    /**
     * @param array<int, array{driver_id: string, distance: float, rating: float|null, acceptance_rate: float|null}> $candidates
     * @return array<int, array<string, mixed>>
     */
    public function rank(string $bookingId, array $candidates): array
    {
        $ranked = [];

        foreach ($candidates as $candidate) {
            $recentAssignments = $this->assignments
                ->findByDriverId($candidate['driver_id']);

            $load = is_array($recentAssignments) ? count($recentAssignments) : ($recentAssignments ? 1 : 0);

            $score = $this->scoring->score(
                (float) ($candidate['distance'] ?? 0.0),
                $candidate['rating'] ?? null,
                $candidate['acceptance_rate'] ?? null,
            );

            $score = max(0.0, $score - ($load * 0.05));

            $ranked[] = new DispatchCandidate(array_merge($candidate, [
                'score' => $score,
            ]));
        }

        usort($ranked, static fn (DispatchCandidate $a, DispatchCandidate $b) => $b->score <=> $a->score);

        return array_map(static fn (DispatchCandidate $c) => $c->toArray(), $ranked);
    }
}
