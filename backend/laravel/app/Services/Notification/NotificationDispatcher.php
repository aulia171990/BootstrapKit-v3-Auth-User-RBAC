<?php

namespace App\Services\Notification;

use App\Events\BookingCreated;
use App\Events\CustomerRegistered;
use App\Events\DriverApproved;
use App\Events\DriverAssigned;
use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Events\TripCompleted;
use App\Events\TripStarted;
use App\Events\WalletTopupCompleted;
use App\Models\Notification\Notification;

final class NotificationDispatcher
{
    public function __construct(private NotificationService $notifications) {}

    public function dispatch(object $event, ?string $userId): Notification
    {
        if ($userId === null) {
            return $this->notifications->createForUser(
                $this->resolveSenderId($event),
                $this->defaultTitle($event),
                '',
                [],
                'in_app',
            );
        }

        return $this->notifications->createForUser(
            $userId,
            $this->defaultTitle($event),
            $this->defaultBody($event),
            $this->context($event),
            'in_app',
        );
    }

    private function resolveSenderId(object $event): string
    {
        $property = match (get_class($event)) {
            TripStarted::class, TripCompleted::class => 'trip',
            PaymentSucceeded::class, PaymentFailed::class => 'payment',
            WalletTopupCompleted::class => 'wallet',
            BookingCreated::class => 'booking',
            DriverAssigned::class, DriverApproved::class => 'driver',
            CustomerRegistered::class => 'user',
            default => 'event',
        };

        return $event->$property->user_id ?? $event->$property->id ?? 'system';
    }

    private function defaultTitle(object $event): string
    {
        return match (get_class($event)) {
            BookingCreated::class => 'Booking Diterima',
            DriverAssigned::class => 'Driver Ditemukan',
            DriverApproved::class => 'Driver Disetujui',
            TripStarted::class => 'Trip Dimulai',
            TripCompleted::class => 'Trip Selesai',
            PaymentSucceeded::class => 'Pembayaran Berhasil',
            PaymentFailed::class => 'Pembayaran Gagal',
            WalletTopupCompleted::class => 'Topup Berhasil',
            CustomerRegistered::class => 'Selamat Datang',
            default => class_basename($event),
        };
    }

    private function defaultBody(object $event): string
    {
        return '';
    }

    /**
     * @return array<string,mixed>
     */
    private function context(object $event): array
    {
        return [
            'event' => class_basename($event),
            'payload' => is_object($event) ? get_object_vars($event) : [],
        ];
    }
}
