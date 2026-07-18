<?php

namespace App\Services\Rating;

use App\Jobs\Rating\UpdateRatingSummaryJob;
use App\Models\User;
use App\Repositories\Rating\RatingRepository;
use App\Repositories\Rating\RatingSummaryRepository;
use Illuminate\Cache\CacheManager;

class RatingSummaryService
{
    public function __construct(
        private RatingRepository $ratings,
        private RatingSummaryRepository $summaries,
        private CacheManager $cache,
    ) {}

    public function summaryForUser(string $userId): array
    {
        return $this->cache->tags(['ratings'])->remember("rating_summary:{$userId}", 3600, function () use ($userId) {
            $stats = $this->ratings->statsForUser($userId);

            return [
                'user_id' => $userId,
                'average' => (float) ($stats['average'] ?? 0),
                'count' => (int) ($stats['count'] ?? 0),
                'distribution' => $stats['distribution'] ?? [],
                'category_averages' => $stats['category_averages'] ?? [],
                'updated_at' => now()->toDateTimeString(),
            ];
        });
    }

    public function enqueueRecalculation(string $userId): void
    {
        UpdateRatingSummaryJob::dispatch($userId);
    }
}
