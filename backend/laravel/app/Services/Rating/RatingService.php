<?php

namespace App\Services\Rating;

use App\Events\Rating\RatingSubmitted;
use App\Events\Rating\ReviewReported;
use App\Exceptions\Rating\RatingException;
use App\Jobs\Rating\UpdateRatingSummaryJob;
use App\Models\Rating\Rating;
use App\Models\Rating\RatingReport;
use App\Models\Rating\RatingReview;
use App\Repositories\Rating\RatingRepository;
use Illuminate\Support\Facades\DB;

class RatingService
{
    public function __construct(private RatingRepository $ratings) {}

    public function submit(array $data): Rating
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['trip_id'])) {
                throw new RatingException('Trip is required.');
            }

            $exists = $this->ratings->findByTripParticipant($data['trip_id'], $data['rater_user_id'], $data['rated_user_id']);
            if ($exists) {
                throw new RatingException('Rating already exists for this trip participant.');
            }

            $rating = $this->ratings->create([
                'trip_id' => $data['trip_id'],
                'rater_user_id' => $data['rater_user_id'],
                'rated_user_id' => $data['rated_user_id'],
                'score' => (int) $data['score'],
                'comment' => $data['comment'] ?? null,
                'is_anonymous' => (bool) ($data['is_anonymous'] ?? false),
                'category_scores' => $data['category_scores'] ?? null,
                'status' => 'active',
            ]);

            RatingSubmitted::dispatch($rating);

            UpdateRatingSummaryJob::dispatch($rating->rated_user_id);

            return $rating;
        });
    }

    public function update(string $ratingId, array $data): Rating
    {
        $rating = $this->ratings->find($ratingId);

        if (! $rating) {
            throw new RatingException('Rating not found.');
        }

        $rating->forceFill([
            'score' => (int) $data['score'],
            'comment' => $data['comment'] ?? $rating->comment,
            'category_scores' => $data['category_scores'] ?? $rating->category_scores,
            'status' => $data['status'] ?? $rating->status,
        ])->save();

        UpdateRatingSummaryJob::dispatch($rating->rated_user_id);

        return $rating;
    }

    public function report(string $ratingId, array $data): RatingReport
    {
        $rating = app(\App\Repositories\Rating\RatingRepository::class)->find($ratingId);

        if (! $rating) {
            throw new RatingException('Rating not found.');
        }

        $report = $rating->reports()->create([
            'reporter_user_id' => $data['reporter_user_id'],
            'reason' => $data['reason'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => 'open',
        ]);

        $rating->forceFill(['status' => 'reported', 'reported_at' => now()])->save();

        ReviewReported::dispatch($rating, $report);

        return $report;
    }
}
