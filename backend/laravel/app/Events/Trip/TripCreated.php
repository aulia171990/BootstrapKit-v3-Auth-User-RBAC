<?php

namespace App\Events\Trip;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TripCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public $trip) {}

    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\PresenceChannel('trip.'.$this->trip->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['trip_id' => $this->trip->id, 'status' => $this->trip->status];
    }
}