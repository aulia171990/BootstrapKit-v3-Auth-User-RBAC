<?php

namespace App\Events\Promotion;

use App\Models\Promotion\Promotion;
use App\Models\Promotion\PromotionRedemption;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PromotionRedeemed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Promotion $promotion,
        public PromotionRedemption $redemption,
    ) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('promotions')];
    }

    /**
     * @return array<string,mixed>
     */
    public function broadcastWith(): array
    {
        return ['promotion_id' => $this->promotion->id, 'redemption_id' => $this->redemption->id];
    }
}
