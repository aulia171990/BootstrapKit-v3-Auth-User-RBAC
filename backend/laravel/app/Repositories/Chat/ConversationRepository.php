<?php

namespace App\Repositories\Chat;

use App\Models\Chat\Conversation;

class ConversationRepository
{
    public function create(array $data): Conversation
    {
        return Conversation::create($data);
    }

    public function findForUser(string $conversationId, string $userId): ?Conversation
    {
        return Conversation::where('id', $conversationId)
            ->whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->first();
    }

    public function paginateForUser(string $userId, int $perPage = 20)
    {
        return Conversation::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->orderByDesc('updated_at')->paginate($perPage);
    }
}
