<?php

namespace App\Events\Trip;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TripCancelled implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param \App\Models\Trip $trip
     * @param string|null $reason
     */
    public function __construct(
        public $trip,
        public ?string $reason = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('trip.'.$this->trip->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'trip_id' => $this->trip->id,
            'status' => $this->trip->status,
            'reason' => $this->reason,
        ];
    }
}
