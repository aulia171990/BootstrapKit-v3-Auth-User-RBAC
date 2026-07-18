<?php

namespace App\Services;

class DispatchScoringService
{
    public function score(
        float $distanceKm,
        ?float $rating,
        ?float $acceptanceRate,
        float $cancellationRate = 0.0,
        ?int $idleSeconds = null
    ): float {
        $cfg = config('dispatch.scoring', [
            'distance_weight' => 0.45,
            'rating_weight' => 0.25,
            'acceptance_rate_weight' => 0.2,
            'cancellation_rate_weight' => 0.1,
            'idle_time_weight' => 0.0,
        ]);

        $distanceScore = max(0.0, 1.0 - min($distanceKm / 50.0, 1.0));
        $ratingScore = $rating !== null ? min(max($rating / 5.0, 0.0), 1.0) : 0.5;
        $acceptanceScore = min(max($acceptanceRate ?? 0.0, 0.0), 1.0);
        $cancellationPenalty = max(0.0, 1.0 - min($cancellationRate, 1.0));
        $idleScore = $idleSeconds !== null ? min(max($idleSeconds / 3600.0, 0.0), 1.0) : 0.0;

        return round(
            ($distanceScore * ($cfg['distance_weight'] ?? 0.45))
            + ($ratingScore * ($cfg['rating_weight'] ?? 0.25))
            + ($acceptanceScore * ($cfg['acceptance_rate_weight'] ?? 0.2))
            + ($cancellationPenalty * ($cfg['cancellation_rate_weight'] ?? 0.1))
            + ($idleScore * ($cfg['idle_time_weight'] ?? 0.0)),
            4
        );
    }
}
