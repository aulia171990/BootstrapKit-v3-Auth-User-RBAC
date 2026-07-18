<?php

namespace App\Repositories\Chat;

use App\Models\Chat\MessageAttachment;

class MessageAttachmentRepository
{
    public function create(string $messageId, array $data): MessageAttachment
    {
        return MessageAttachment::create(array_merge($data, ['message_id' => $messageId]));
    }
}
