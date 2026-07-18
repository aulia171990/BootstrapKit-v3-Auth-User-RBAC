<?php

namespace App\Repositories\Chat;

use App\Models\Chat\ConversationParticipant;

class ConversationParticipantRepository
{
    public function create(string $conversationId, string $userId, array $metadata = []): ConversationParticipant
    {
        return ConversationParticipant::create([
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'metadata' => $metadata,
            'joined_at' => now(),
        ]);
    }
}
