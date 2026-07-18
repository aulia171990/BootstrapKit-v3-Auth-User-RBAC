<?php

namespace App\Notifications\Channels;

final class WebhookChannel implements NotificationChannelInterface
{
    public function name(): string
    {
        return 'webhook';
    }

    public function send(array $payload): bool
    {
        // Future integration: outbound webhook dispatch.
        return true;
    }
}
