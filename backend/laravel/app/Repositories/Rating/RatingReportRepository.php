<?php

namespace App\Repositories\Rating;

use App\Models\Rating\RatingReport;

class RatingReportRepository
{
    public function create(string $ratingId, array $data): RatingReport
    {
        return RatingReport::create(array_merge($data, ['rating_id' => $ratingId]));
    }

    public function markReviewedByRating(string $ratingId): void
    {
        \Illuminate\Support\Facades\DB::table('rating_reports')
            ->where('rating_id', $ratingId)
            ->update(['status' => 'reviewed', 'reviewed_at' => now()]);

        \Illuminate\Support\Facades\DB::table('review_reports')
            ->where('rating_id', $ratingId)
            ->update(['status' => 'reviewed', 'reviewed_at' => now()]);
    }
}
