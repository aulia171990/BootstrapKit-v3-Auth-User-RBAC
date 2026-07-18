<?php

namespace App\Services\Chat;

use App\Models\Chat\Message;

class MessageService
{
    public function paginated(string $conversationId, int $perPage = 50)
    {
        return app(\App\Repositories\Chat\MessageRepository::class)
            ->paginateForConversation($conversationId, $perPage);
    }

    public function send(array $payload): Message
    {
        return app(ChatService::class)->sendMessage($payload);
    }

    public function markRead(string $conversationId, string $messageId, string $userId): void
    {
        app(ChatService::class)->read($conversationId, $messageId, $userId);
    }

    public function delete(string $messageId, string $userId): void
    {
        app(ChatService::class)->delete($messageId, $userId);
    }
}
