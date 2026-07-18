<?php

namespace App\Events\Promotion;

use App\Models\Promotion\Promotion;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PromotionExpired implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Promotion $promotion) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('promotions')];
    }

    /**
     * @return array<string,mixed>
     */
    public function broadcastWith(): array
    {
        return ['id' => $this->promotion->id, 'status' => 'expired'];
    }
}
