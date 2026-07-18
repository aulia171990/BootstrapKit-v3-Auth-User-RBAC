<?php

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationDelivery;

class NotificationDeliveryRepository
{
    public function create(string $notificationId, string $channel, array $payload = []): NotificationDelivery
    {
        return NotificationDelivery::create([
            'notification_id' => $notificationId,
            'channel' => $channel,
            'payload' => $payload,
        ]);
    }

    public function markSent(string $id, ?string $provider = null, ?array $response = null): void
    {
        $delivery = NotificationDelivery::find($id);

        if ($delivery) {
            $delivery->forceFill([
                'status' => 'delivered',
                'sent_at' => now(),
                'provider' => $provider,
                'response' => $response,
            ])->save();
        }
    }

    public function markFailed(
        string $id,
        ?string $errorCode,
        ?string $errorMessage
    ): void {
        $delivery = NotificationDelivery::find($id);

        if ($delivery) {
            $delivery->forceFill([
                'status' => 'failed',
                'failed_at' => now(),
                'retry_count' => $delivery->retry_count + 1,
                'error_code' => $errorCode,
                'error_message' => $errorMessage,
            ])->save();
        }
    }
}
