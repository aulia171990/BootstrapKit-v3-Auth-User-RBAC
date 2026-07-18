<?php

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationPreference;

class NotificationPreferenceRepository
{
    public function forUser(string $userId): array
    {
        return NotificationPreference::where('user_id', $userId)->get()->all();
    }

    public function set(string $userId, string $channel, bool $enabled, ?array $settings = null): NotificationPreference
    {
        return NotificationPreference::updateOrCreate(
            ['user_id' => $userId, 'channel' => $channel],
            ['enabled' => $enabled, 'settings' => $settings]
        );
    }
}
