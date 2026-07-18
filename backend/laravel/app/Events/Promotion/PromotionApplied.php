<?php

namespace App\Events\Promotion;

use App\Models\Promotion\Promotion;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PromotionApplied implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param array<string,mixed> $discount
     * @param array<string,mixed> $context
     */
    public function __construct(
        public Promotion $promotion,
        public array $discount,
        public array $context = [],
    ) {}

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\Channel('promotions')];
    }
}
