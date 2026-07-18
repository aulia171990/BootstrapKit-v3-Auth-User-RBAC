<?php

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationTemplate;

class NotificationTemplateRepository
{
    public function findByCode(string $code): ?NotificationTemplate
    {
        return NotificationTemplate::where('code', $code)
            ->where('is_active', true)
            ->first();
    }

    public function create(array $data): NotificationTemplate
    {
        return NotificationTemplate::create($data);
    }
}
