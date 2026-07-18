<?php

namespace App\Jobs\Promotion;

use App\Services\Notification\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PromotionNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ?string $userId, public string $promotionId) {}

    public function handle(): void
    {
        if (! $this->userId) {
            return;
        }

        app(NotificationService::class)->createForUser(
            $this->userId,
            'Promosi Aktif',
            'Ada promosi baru yang bisa kamu pakai.',
            ['promotion_id' => $this->promotionId],
            'in_app',
        );
    }
}
