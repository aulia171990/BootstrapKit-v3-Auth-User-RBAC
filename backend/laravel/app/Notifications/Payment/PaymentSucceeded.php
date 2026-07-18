<?php

namespace App\Notifications\Payment;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PaymentSucceeded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ?string $transactionReference) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('Pembayaran Berhasil')->line("Transaksi {$this->transactionReference} berhasil.");
    }
}
