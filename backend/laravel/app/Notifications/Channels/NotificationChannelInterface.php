<?php

namespace App\Notifications\Channels;

interface NotificationChannelInterface
{
    public function name(): string;

    /**
     * @param array<string,mixed> $payload
     */
    public function send(array $payload): bool;
}
