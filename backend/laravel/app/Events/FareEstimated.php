<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FareEstimated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $components,
        public string|null $bookingId,
        public string|null $tripId,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('pricing')];
    }

    public function broadcastAs(): string
    {
        return 'fare.estimated';
    }
}
