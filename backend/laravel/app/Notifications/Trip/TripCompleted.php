<?php

namespace App\Notifications\Trip;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TripCompleted extends Notification implements ShouldQueue
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
            ->subject('Trip Completed')
            ->line('Trip '.($this->trip->trip_code ?? '').' has completed.');
    }

    public function toArray($notifiable): array
    {
        return [
            'trip_id' => $this->trip->id,
            'trip_code' => $this->trip->trip_code,
        ];
    }
}
