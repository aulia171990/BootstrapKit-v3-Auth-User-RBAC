<?php

namespace App\Notifications\Channels;

final class PushNotificationChannel implements NotificationChannelInterface
{
    public function name(): string
    {
        return 'push';
    }

    public function send(array $payload): bool
    {
        // Future integration: push provider such as Firebase / APNs.
        return true;
    }
}
