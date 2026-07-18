<?php

namespace App\Notifications\Channels;

final class EmailChannel implements NotificationChannelInterface
{
    public function name(): string
    {
        return 'email';
    }

    public function send(array $payload): bool
    {
        // Future integration: MailProvider driver.
        return true;
    }
}
