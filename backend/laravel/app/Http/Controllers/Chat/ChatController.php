<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Repositories\Chat\ConversationRepository;
use App\Services\Chat\AttachmentService;
use App\Services\Chat\ConversationService;
use App\Services\Chat\MessageService;
use App\Services\Chat\ReadReceiptService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private ConversationService $conversations,
        private MessageService $messages,
        private AttachmentService $attachments,
        private ReadReceiptService $receipts,
    ) {}

    public function conversations(Request $request)
    {
        $userId = (string) $request->user()->id;

        return ApiResponse::success($this->conversations->listForUser($userId));
    }

    public function show(Request $request, string $id)
    {
        $userId = (string) $request->user()->id;
        $conversation = app(ConversationRepository::class)->findForUser($id, $userId);

        return ApiResponse::success($conversation ?? (object) []);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:trip,support,merchant,group'],
            'trip_id' => ['nullable', 'string'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*' => ['required', 'string'],
        ]);

        $conversation = $this->conversations->openForTrip($validated['trip_id'] ?? null, (string) $request->user()->id, $validated['participants']);

        return ApiResponse::success($conversation, 'Conversation created', 201);
    }

    public function messages(Request $request, string $conversation)
    {
        $userId = (string) $request->user()->id;
        $conversationModel = app(ConversationRepository::class)->findForUser($conversation, $userId);

        if (! $conversationModel) {
            return ApiResponse::error('Conversation not found', 404);
        }

        return ApiResponse::success($this->messages->paginated($conversation, (int) $request->input('per_page', 50)));
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'body' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:text,image,location,quick_reply,system'],
            'payload' => ['nullable', 'array'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.type' => ['required', 'string'],
            'attachments.*.url' => ['required', 'string'],
            'attachments.*.size' => ['nullable', 'integer', 'min:0', 'max:10485760'],
            'attachments.*.mime_type' => ['nullable', 'string'],
        ]);

        $message = $this->messages->send(array_merge($validated, ['sender_id' => $request->user()->id]));

        return ApiResponse::success($message, 'Message sent', 201);
    }

    public function update(Request $request, string $id)
    {
        $message = \App\Models\Chat\Message::where('id', $id)->where('sender_id', $request->user()->id)->first();

        if (! $message) {
            return ApiResponse::error('Message not found', 404);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message->forceFill(['body' => $validated['body'], 'edited_at' => now()])->save();

        return ApiResponse::success($message, 'Message updated');
    }

    public function delete(Request $request, string $id)
    {
        $this->messages->delete($id, (string) $request->user()->id);

        return ApiResponse::success(null, 'Message deleted');
    }

    public function read(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string'],
            'message_id' => ['required', 'string'],
        ]);

        $this->messages->markRead($validated['conversation_id'], $validated['message_id'], (string) $request->user()->id);

        return ApiResponse::success(null, 'Marked as read');
    }

    public function unread(Request $request, string $conversation)
    {
        $userId = (string) $request->user()->id;
        $conversationModel = app(ConversationRepository::class)->findForUser($conversation, $userId);

        if (! $conversationModel) {
            return ApiResponse::error('Conversation not found', 404);
        }

        return ApiResponse::success(['unread_count' => $this->receipts->countForConversation($conversation, $userId)]);
    }
}
