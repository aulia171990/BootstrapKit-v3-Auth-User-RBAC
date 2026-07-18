<?php

namespace App\Services\Strategies;

use App\Models\DispatchCandidate;
use App\Services\DispatchScoringService;

class PreferredDriverStrategy
{
    public function __construct(private DispatchScoringService $scoring) {}

    /**
     * @param array<int, array{driver_id: string, distance: float, rating: float|null, acceptance_rate: float|null, preferred_driver_id?: string}> $candidates
     * @return array<int, array<string, mixed>>
     */
    public function rank(string $bookingId, array $candidates): array
    {
        $ranked = [];

        foreach ($candidates as $candidate) {
            $isPreferred = ! empty($candidate['preferred_driver_id']) && $candidate['driver_id'] === $candidate['preferred_driver_id'];

            $score = $this->scoring->score(
                (float) ($candidate['distance'] ?? 0.0),
                $candidate['rating'] ?? null,
                $candidate['acceptance_rate'] ?? null,
            );

            if ($isPreferred) {
                $score = min(1.0, $score + 0.2);
            }

            $ranked[] = new DispatchCandidate(array_merge($candidate, [
                'score' => $score,
            ]));
        }

        usort($ranked, static fn (DispatchCandidate $a, DispatchCandidate $b) => $b->score <=> $a->score);

        return array_map(static fn (DispatchCandidate $c) => $c->toArray(), $ranked);
    }
}
