<?php

namespace App\Events\Rating;

use App\Models\Rating\Rating;
use App\Models\Rating\RatingReport;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewReported implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Rating $rating, public RatingReport $report) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('ratings')];
    }
}
