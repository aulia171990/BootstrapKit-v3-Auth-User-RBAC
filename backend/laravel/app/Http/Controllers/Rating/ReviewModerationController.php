<?php

namespace App\Http\Controllers\Rating;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Rating\ReviewModerationService;
use Illuminate\Http\Request;

class ReviewModerationController extends Controller
{
    public function __construct(private ReviewModerationService $moderation) {}

    public function moderate(Request $request, string $ratingId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,hidden'],
        ]);

        $this->moderation->moderate($ratingId, $validated['status']);

        return ApiResponse::success(null, 'Moderation updated');
    }
}
