<?php

namespace App\Notifications\Channels;

final class SmsChannel implements NotificationChannelInterface
{
    public function name(): string
    {
        return 'sms';
    }

    public function send(array $payload): bool
    {
        // Future integration: SMS gateway.
        return true;
    }
}
