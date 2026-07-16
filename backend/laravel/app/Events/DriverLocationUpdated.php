<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Posisi driver di-update secara realtime (live tracking).
 * Di-broadcast ke channel privat order.{orderId} agar customer yang
 * punya order tersebut menerima update posisi tiap kali driver bergerak.
 */
class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Order $order,
        public float $latitude,
        public float $longitude,
        public ?float $heading = null,
        public ?float $speed = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('order.' . $this->order->id)];
    }

    public function broadcastAs(): string
    {
        return 'driver.location.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'driver' => [
                'id' => $this->order->driver?->id,
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'heading' => $this->heading,
                'speed' => $this->speed,
                'status' => $this->order->driver?->status,
                'vehicle_type' => $this->order->driver?->vehicle_type,
            ],
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
