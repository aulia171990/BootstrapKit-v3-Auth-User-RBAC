<?php

namespace App\Services\Rating;

use App\Events\Rating\RatingUpdated;
use App\Repositories\Rating\RatingRepository;
use App\Repositories\Rating\RatingReportRepository;

class ReviewModerationService
{
    public function __construct(
        private RatingRepository $ratings,
        private RatingReportRepository $reports,
    ) {}

    public function moderate(string $ratingId, string $status): void
    {
        $rating = $this->ratings->find($ratingId);

        if (! $rating) {
            throw new \App\Exceptions\Rating\RatingException('Rating not found.');
        }

        $rating->forceFill([
            'status' => 'active' === $status ? 'active' : 'hidden',
            'moderated_at' => now(),
        ])->save();

        $this->reports->markReviewedByRating($ratingId);

        RatingUpdated::dispatch($rating);
    }

    public function dismissReports(string $ratingId): void
    {
        $this->reports->markReviewedByRating($ratingId);
    }
}
