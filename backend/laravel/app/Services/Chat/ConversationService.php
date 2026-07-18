<?php

namespace App\Services\Chat;

use App\Models\Chat\Conversation;

class ConversationService
{
    public function listForUser(string $userId, int $perPage = 20)
    {
        return app(\App\Repositories\Chat\ConversationRepository::class)->paginateForUser($userId, $perPage);
    }

    public function openForTrip(string $tripId, string $createdBy, array $participants): Conversation
    {
        return app(ChatService::class)->createConversation([
            'type' => 'trip',
            'trip_id' => $tripId,
            'created_by' => $createdBy,
            'status' => 'open',
            'participants' => $participants,
        ]);
    }
}
