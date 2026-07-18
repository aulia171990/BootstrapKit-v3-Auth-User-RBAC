<?php

namespace App\Notifications\Wallet;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class WithdrawalCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $transactionId, public readonly int $amount) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Penarikan Selesai')->line("Penarikan sebesar {$this->amount} telah selesai.");
    }
}
