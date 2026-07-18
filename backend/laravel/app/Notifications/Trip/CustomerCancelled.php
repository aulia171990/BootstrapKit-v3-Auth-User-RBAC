<?php

namespace App\Notifications\Trip;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomerCancelled extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public $trip) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Trip Cancelled')
            ->line('Trip '.($this->trip->trip_code ?? '').' was cancelled.');
    }

    public function toArray($notifiable): array
    {
        return [
            'trip_id' => $this->trip->id,
            'trip_code' => $this->trip->trip_code,
        ];
    }
}
