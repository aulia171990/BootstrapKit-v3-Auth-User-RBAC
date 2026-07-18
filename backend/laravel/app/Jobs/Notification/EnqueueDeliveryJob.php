<?php

namespace App\Jobs\Notification;

use App\Models\Notification\NotificationDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnqueueDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $deliveryId,
        public string $notificationId,
        public string $channel,
    ) {}

    public function handle(): void
    {
        $delivery = NotificationDelivery::find($this->deliveryId);

        if (! $delivery) {
            return;
        }

        $channel = match ($delivery->channel) {
            'email' => app(\App\Notifications\Channels\EmailChannel::class),
            'push' => app(\App\Notifications\Channels\PushNotificationChannel::class),
            'sms' => app(\App\Notifications\Channels\SmsChannel::class),
            'whatsapp' => app(\App\Notifications\Channels\WhatsAppChannel::class),
            'webhook' => app(\App\Notifications\Channels\WebhookChannel::class),
            default => app(\App\Notifications\Channels\InAppChannel::class),
        };

        $success = $channel->send([
            'delivery_id' => $delivery->id,
            'notification_id' => $delivery->notification_id,
            'channel' => $delivery->channel,
            'payload' => $delivery->payload ?? [],
        ]);

        if ($success) {
            app(\App\Repositories\Notification\NotificationDeliveryRepository::class)
                ->markSent($delivery->id);
        } else {
            app(\App\Repositories\Notification\NotificationDeliveryRepository::class)
                ->markFailed($delivery->id, 'delivery_failed', 'Channel execution returned failure.');
        }
    }
}
