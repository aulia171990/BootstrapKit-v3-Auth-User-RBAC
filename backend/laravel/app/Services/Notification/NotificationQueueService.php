<?php

namespace App\Services\Notification;

use App\Jobs\Notification\EnqueueDeliveryJob;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationDelivery;

class NotificationQueueService
{
    public function enqueue(Notification $notification): void
    {
        $channels = $this->loadPreferenceChannels((string) $notification->user_id);

        foreach ($channels as $channel) {
            $delivery = app(\App\Repositories\Notification\NotificationDeliveryRepository::class)
                ->create((string) $notification->id, $channel, []);

            EnqueueDeliveryJob::dispatch((string) $delivery->id, (string) $notification->id, $channel);
        }
    }

    public function enqueueRetry(string $deliveryId, string $notificationId, string $channel): void
    {
        EnqueueDeliveryJob::dispatch($deliveryId, $notificationId, $channel);
    }

    private function loadPreferenceChannels(string $userId): array
    {
        $defaults = ['in_app'];
        $records = app(\App\Repositories\Notification\NotificationPreferenceRepository::class)->forUser($userId);

        $enabled = [];
        foreach ($defaults as $ch) {
            $pref = collect($records)->first(fn ($p) => $p->channel === $ch);
            $enabled[] = ($pref && !$pref->enabled) ? null : $ch;
        }

        return array_values(array_filter($enabled, fn ($v) => $v !== null));
    }
}
