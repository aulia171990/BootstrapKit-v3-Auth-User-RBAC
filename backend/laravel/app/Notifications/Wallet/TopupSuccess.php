<?php

namespace App\Notifications\Wallet;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TopupSuccess extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $transactionId, public readonly int $amount) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Top Up Berhasil')->line("Top up sebesar {$this->amount} berhasil.");
    }
}
