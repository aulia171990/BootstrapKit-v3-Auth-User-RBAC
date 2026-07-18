<?php

namespace App\Http\Controllers\Rating;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Repositories\Rating\RatingRepository;
use App\Services\Rating\RatingService;
use App\Services\Rating\RatingSummaryService;
use App\Services\Rating\ReviewModerationService;
use App\Services\Rating\ReviewService;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function __construct(
        private RatingService $ratings,
        private ReviewService $reviews,
        private RatingSummaryService $summaries,
        private ReviewModerationService $moderation,
    ) {}

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => ['required', 'string'],
            'rater_user_id' => ['required', 'string'],
            'rated_user_id' => ['required', 'string'],
            'score' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_anonymous' => ['boolean'],
            'category_scores' => ['nullable', 'array'],
        ]);

        return ApiResponse::success($this->ratings->submit($validated), 'Rating submitted', 201);
    }

    public function show(Request $request, string $id)
    {
        return ApiResponse::success($this->ratings->find($id) ?? (object) []);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'category_scores' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:active,reported,hidden'],
        ]);

        return ApiResponse::success($this->ratings->update($id, $validated), 'Rating updated');
    }

    public function forDriver(Request $request, string $driverId)
    {
        $ratings = app(RatingRepository::class)->paginateActive((int) ($request->input('per_page', 20)));

        return ApiResponse::success($ratings);
    }

    public function forCustomer(Request $request, string $customerId)
    {
        $ratings = app(RatingRepository::class)->paginateActive((int) ($request->input('per_page', 20)));

        return ApiResponse::success($ratings);
    }

    public function report(Request $request, string $ratingId)
    {
        $validated = $request->validate([
            'reporter_user_id' => ['required', 'string'],
            'reason' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        return ApiResponse::success($this->ratings->report($ratingId, $validated), 'Review reported', 201);
    }

    public function summary(Request $request, string $userId)
    {
        return ApiResponse::success($this->summaries->summaryForUser($userId));
    }
}
