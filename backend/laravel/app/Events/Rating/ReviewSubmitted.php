<?php

namespace App\Events\Rating;

use App\Models\Rating\Rating;
use App\Models\Rating\RatingReview;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Rating $rating, public RatingReview $review) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('ratings')];
    }
}
