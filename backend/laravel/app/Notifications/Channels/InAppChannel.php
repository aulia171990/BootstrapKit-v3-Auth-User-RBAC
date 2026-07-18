<?php

namespace App\Notifications\Channels;

use App\Models\Notification\Notification;
use App\Models\Notification\NotificationDelivery;
use App\Repositories\Notification\NotificationDeliveryRepository;

final class InAppChannel implements NotificationChannelInterface
{
    public function __construct(private NotificationDeliveryRepository $deliveries) {}

    public function name(): string
    {
        return 'in_app';
    }

    public function send(array $payload): bool
    {
        $notification = Notification::find($payload['notification_id'] ?? '');
        $delivery = NotificationDelivery::find($payload['delivery_id'] ?? '');

        if (! $notification || ! $delivery) {
            return false;
        }

        // In-app is considered delivered once persisted.
        // Persisted delivery row is created before queuing, so do nothing else.

        return true;
    }
}
