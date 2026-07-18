<?php

namespace App\Jobs\Notification;

use App\Models\Notification\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BulkDispatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param array<int, Notification> $notifications
     */
    public function __construct(public array $notifications) {}

    public function handle(): void
    {
        foreach ($this->notifications as $notification) {
            app(\App\Services\Notification\NotificationQueueService::class)
                ->enqueue($notification);
        }
    }
}
