<?php

namespace App\Services\Notification;

use App\Models\Notification\Notification;
use App\Repositories\Notification\NotificationRepository;

class NotificationService
{
    public function __construct(
        private NotificationRepository $notifications,
        private NotificationQueueService $queue,
    ) {}

    public function createForUser(
        string $userId,
        string $title,
        string $body = '',
        array $data = [],
        string $channel = 'in_app',
        ?string $subject = null,
    ): Notification {
        $notification = $this->notifications->create([
            'user_id' => $userId,
            'type' => $channel,
            'title' => $title,
            'body' => $body ?: null,
            'data' => empty($data) ? null : $data,
            'locale' => 'id',
        ]);

        if ($subject) {
            $this->queue->enqueue($notification);
        }

        return $notification;
    }

    /**
     * @return array<string,mixed>
     */
    public function listForUser(string $userId, int $perPage = 20): array
    {
        $paginator = $this->notifications->paginateForUser($userId, $perPage);

        return [
            'items' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ];
    }

    public function unreadCount(string $userId): int
    {
        return $this->notifications->unreadCountForUser($userId);
    }

    public function markRead(string $userId, string $notificationId): void
    {
        $this->notifications->markRead($notificationId);
    }

    public function markAllRead(string $userId): void
    {
        $this->notifications->markAllRead($userId);
    }

    /**
     * @return array<int, array<string,mixed>>
     */
    public function preferences(string $userId): array
    {
        return app(NotificationPreferenceService::class)->all($userId);
    }

    public function updatePreference(string $userId, string $channel, bool $enabled, ?array $settings = null): void
    {
        app(NotificationPreferenceService::class)->upsert($userId, $channel, $enabled, $settings);
    }
}
