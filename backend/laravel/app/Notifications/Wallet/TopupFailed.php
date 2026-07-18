<?php

namespace App\Notifications\Wallet;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TopupFailed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $transactionId, public readonly ?string $reason) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Top Up Gagal')->line('Top up gagal: '.($this->reason ?? 'unknown'));
    }
}
