<?php

namespace App\Notifications\Wallet;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TripPayment extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $walletTransactionId, public readonly int $amount) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Pembayaran Trip')->line("Pembayaran trip sebesar {$this->amount} telah dipotong.");
    }
}
