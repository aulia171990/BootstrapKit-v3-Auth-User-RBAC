<?php

namespace App\Events\Operation;

use App\Models\Operation\OperationIncident;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncidentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public OperationIncident $incident) {}

    public function broadcastOn(): array
    {
        return [new Channel('operations')];
    }
}
