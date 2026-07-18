<?php

namespace App\Services\Chat;

class ReadReceiptService
{
    public function countForConversation(string $conversationId, string $userId): int
    {
        return app(\App\Repositories\Chat\MessageRepository::class)->unreadCountForUser($conversationId, $userId);
    }
}
