<?php

namespace App\Notifications\Wallet;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $transactionId, public readonly int $amount) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }
}
