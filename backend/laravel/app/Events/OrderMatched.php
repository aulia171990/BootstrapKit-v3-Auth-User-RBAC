<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderMatched implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Order $order, public array $candidates) {}

    public function broadcastOn(): array
    {
        // Tiap kandidat driver dapat notifikasi di channel privatnya.
        return array_map(
            fn ($driver) => new PrivateChannel('driver.' . $driver->id),
            $this->candidates
        );
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'pickup_lat' => $this->order->pickup_lat,
            'pickup_lng' => $this->order->pickup_lng,
            'pickup_address' => $this->order->pickup_address,
            'price' => $this->order->price,
        ];
    }
}
