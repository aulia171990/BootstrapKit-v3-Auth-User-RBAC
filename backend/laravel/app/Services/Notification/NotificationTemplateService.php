<?php

namespace App\Services\Notification;

use App\Repositories\Notification\NotificationTemplateRepository;

class NotificationTemplateService
{
    public function __construct(private NotificationTemplateRepository $templates) {}

    public function find(string $code): ?\App\Models\Notification\NotificationTemplate
    {
        return $this->templates->findByCode($code);
    }

    public function create(array $data): \App\Models\Notification\NotificationTemplate
    {
        return $this->templates->create($data);
    }
}
