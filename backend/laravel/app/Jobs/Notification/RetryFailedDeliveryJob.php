<?php

namespace App\Jobs\Notification;

use App\Models\Notification\NotificationDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RetryFailedDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $deliveryId) {}

    public function handle(): void
    {
        $delivery = NotificationDelivery::find($this->deliveryId);

        if (! $delivery) {
            return;
        }

        app(\App\Services\Notification\NotificationQueueService::class)
            ->enqueueRetry($delivery->id, $delivery->notification_id, $delivery->channel);
    }
}
