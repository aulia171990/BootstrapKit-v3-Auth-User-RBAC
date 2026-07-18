<?php

namespace App\Services\Notification;

use App\Repositories\Notification\NotificationPreferenceRepository;

class NotificationPreferenceService
{
    public function __construct(private NotificationPreferenceRepository $preferences) {}

    /**
     * @return array<int, array{channel: string, enabled: bool, settings: array<string,mixed>|null}>
     */
    public function all(string $userId): array
    {
        return array_map(static fn ($row) => [
            'channel' => $row->channel,
            'enabled' => (bool) $row->enabled,
            'settings' => $row->settings ?? null,
        ], $this->preferences->forUser($userId));
    }

    public function upsert(string $userId, string $channel, bool $enabled, ?array $settings = null): void
    {
        $this->preferences->set($userId, $channel, $enabled, $settings);
    }
}
