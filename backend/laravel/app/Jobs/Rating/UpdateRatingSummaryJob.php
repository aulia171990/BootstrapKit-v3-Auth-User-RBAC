<?php

namespace App\Jobs\Rating;

use App\Repositories\Rating\RatingRepository;
use App\Repositories\Rating\RatingSummaryRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateRatingSummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $userId) {}

    public function handle(RatingRepository $ratings, RatingSummaryRepository $summaries): void
    {
        $stats = $ratings->statsForUser($this->userId);

        $summaries->upsert($this->userId, [
            'average_rating' => (float) ($stats['average'] ?? 0),
            'rating_count' => (int) ($stats['count'] ?? 0),
            'distribution' => $stats['distribution'] ?? [],
            'category_averages' => $stats['category_averages'] ?? [],
        ]);
    }
}
