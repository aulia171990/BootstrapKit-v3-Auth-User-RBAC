<?php

namespace App\Services\Rating;

use App\Events\Rating\ReviewSubmitted;
use App\Models\Rating\RatingReview;
use App\Repositories\Rating\RatingRepository;

class ReviewService
{
    public function __construct(private RatingRepository $ratings) {}

    public function submitReview(string $ratingId, array $data): RatingReview
    {
        $rating = $this->ratings->find($ratingId);

        if (! $rating) {
            throw new \App\Exceptions\Rating\RatingException('Rating not found.');
        }

        $review = RatingReview::create([
            'rating_id' => $rating->id,
            'reporter_user_id' => $data['reporter_user_id'] ?? null,
            'reason' => $data['reason'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => 'open',
        ]);

        ReviewSubmitted::dispatch($rating, $review);

        return $review;
    }
}
