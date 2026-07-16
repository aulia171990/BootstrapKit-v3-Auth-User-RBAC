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
 * Status order berubah (accepted / ongoing / completed / cancelled).
 * Di-broadcast ke channel privat order.{orderId} agar customer DAN
 * driver yang terlibat menerima perubahan status secara realtime.
 */
class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Order $order,
        public string $status,
        public ?string $note = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('order.' . $this->order->id)];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->status,
            'note' => $this->note,
            'driver' => $this->order->driver
                ? $this->order->driver->only('id', 'latitude', 'longitude', 'status', 'vehicle_type')
                : null,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
