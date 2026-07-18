<?php

namespace App\Events\Promotion;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReferralRewardGranted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public string $actorUserId, public ?string $refereeUserId, public string $promotionId) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('promotions')];
    }
}
