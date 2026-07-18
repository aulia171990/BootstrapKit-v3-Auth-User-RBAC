<?php

namespace App\Services\Chat;

use App\Events\Chat\ConversationCreated;
use App\Events\Chat\MessageDeleted;
use App\Events\Chat\MessageRead;
use App\Events\Chat\MessageSent;
use App\Exceptions\Chat\ChatException;
use App\Jobs\Chat\ProcessAttachmentJob;
use App\Models\Chat\Conversation;
use App\Models\Chat\Message;
use App\Models\Chat\MessageAttachment;
use App\Repositories\Chat\ConversationParticipantRepository;
use App\Repositories\Chat\ConversationRepository;
use App\Repositories\Chat\MessageAttachmentRepository;
use App\Repositories\Chat\MessageReadReceiptRepository;
use App\Repositories\Chat\MessageRepository;
use App\Services\Notification\NotificationService;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function __construct(
        private ConversationRepository $conversations,
        private ConversationParticipantRepository $participants,
        private MessageRepository $messages,
        private MessageAttachmentRepository $attachments,
        private MessageReadReceiptRepository $receipts,
        private NotificationService $notifications,
    ) {}

    public function createConversation(array $data): Conversation
    {
        return DB::transaction(function () use ($data) {
            $conversation = $this->conversations->create($data);

            foreach ((array) ($data['participants'] ?? []) as $userId) {
                $this->participants->create($conversation->id, $userId);
            }

            ConversationCreated::dispatch($conversation);

            return $conversation;
        });
    }

    public function sendMessage(array $data): Message
    {
        $message = DB::transaction(function () use ($data) {
            $this->assertMember($data['conversation_id'], $data['sender_id']);

            $message = $this->messages->create([
                'conversation_id' => $data['conversation_id'],
                'sender_id' => $data['sender_id'],
                'body' => $data['body'] ?? null,
                'type' => $data['type'] ?? 'text',
                'payload' => $data['payload'] ?? null,
            ]);

            if (! empty($data['attachments'])) {
                foreach ((array) $data['attachments'] as $attachment) {
                    $this->attachments->create($message->id, $attachment);
                    ProcessAttachmentJob::dispatch($message->id, $attachment);
                }
            }

            return $message;
        });

        MessageSent::dispatch($message);

        return $message;
    }

    public function read(string $conversationId, string $messageId, string $userId): void
    {
        $this->assertMember($conversationId, $userId);

        $this->receipts->create($messageId, $userId);

        MessageRead::dispatch($conversationId, $messageId, $userId);
    }

    public function delete(string $messageId, string $userId): void
    {
        $message = Message::where('id', $messageId)->where('sender_id', $userId)->first();

        if (! $message) {
            throw new ChatException('Message not found.');
        }

        $message->delete();

        MessageDeleted::dispatch($message);
    }

    private function assertMember(string $conversationId, string $userId): void
    {
        $exists = app(\App\Repositories\Chat\ConversationRepository::class)
            ->findForUser($conversationId, $userId);

        if (! $exists) {
            throw new ChatException('Conversation not found or user is not a participant.');
        }
    }
}
