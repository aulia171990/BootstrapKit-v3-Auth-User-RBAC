<?php

namespace App\Jobs\Chat;

use App\Models\Chat\MessageAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessAttachmentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $messageId, public array $attachment) {}

    public function handle(): void
    {
        MessageAttachment::where('message_id', $this->messageId)
            ->where('url', $this->attachment['url'] ?? null)
            ->update(['processed_at' => now()]);
    }
}
