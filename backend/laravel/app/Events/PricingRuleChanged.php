<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PricingRuleChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int|null $ruleId,
        public string $action,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('pricing')];
    }

    public function broadcastAs(): string
    {
        return 'pricing.rule.changed';
    }
}
