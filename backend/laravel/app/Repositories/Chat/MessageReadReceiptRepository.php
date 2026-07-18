<?php

namespace App\Repositories\Chat;

use App\Models\Chat\MessageReadReceipt;

class MessageReadReceiptRepository
{
    public function create(string $messageId, string $userId, ?string $readAt = null): MessageReadReceipt
    {
        return MessageReadReceipt::create([
            'message_id' => $messageId,
            'user_id' => $userId,
            'read_at' => $readAt ?? now(),
        ]);
    }
}
