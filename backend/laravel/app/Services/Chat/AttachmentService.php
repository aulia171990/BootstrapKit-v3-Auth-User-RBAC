<?php

namespace App\Services\Chat;

use App\Models\Chat\MessageAttachment;

class AttachmentService
{
    public function create(string $messageId, array $data): MessageAttachment
    {
        $allowed = ['image', 'location', 'voice', 'document', 'video'];

        if (! in_array($data['type'] ?? null, $allowed, true)) {
            throw new \App\Exceptions\Chat\ChatException('Unsupported attachment type.');
        }

        if (($data['size'] ?? 0) > 10 * 1024 * 1024) {
            throw new \App\Exceptions\Chat\ChatException('Attachment too large.');
        }

        return app(\App\Repositories\Chat\MessageAttachmentRepository::class)->create($messageId, $data);
    }
}
