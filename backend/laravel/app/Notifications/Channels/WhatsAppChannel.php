<?php

namespace App\Notifications\Channels;

final class WhatsAppChannel implements NotificationChannelInterface
{
    public function name(): string
    {
        return 'whatsapp';
    }

    public function send(array $payload): bool
    {
        // Future integration: WhatsApp provider.
        return true;
    }
}
