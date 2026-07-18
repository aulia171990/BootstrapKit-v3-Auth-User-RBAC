<?php

namespace App\Repositories\Chat;

use App\Models\Chat\Message;
use Illuminate\Cache\CacheManager;

class MessageRepository
{
    public function __construct(private CacheManager $cache) {}

    public function create(array $data): Message
    {
        return Message::create($data);
    }

    public function paginateForConversation(string $conversationId, int $perPage = 50)
    {
        return Message::where('conversation_id', $conversationId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function unreadCountForUser(string $conversationId, string $userId): int
    {
        $key = "chat:unread:{$conversationId}:{$userId}";

        return (int) $this->cache->remember($key, 3600, function () use ($conversationId, $userId) {
            $lastReadAt = \App\Models\Chat\MessageReadReceipt::where('message_id', function ($q) use ($conversationId) {
                    $q->select('id')->from('messages')->where('conversation_id', $conversationId)->orderByDesc('created_at')->limit(1);
                })->value('read_at');

            if (! $lastReadAt) {
                return Message::where('conversation_id', $conversationId)->count();
            }

            return Message::where('conversation_id', $conversationId)->where('created_at', '>', $lastReadAt)->count();
        });
    }
}
