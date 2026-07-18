<?php

namespace App\Listeners\Notification;

use App\Events\BookingCreated;
use App\Events\CustomerRegistered;
use App\Events\DriverApproved;
use App\Events\DriverAssigned;
use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Events\TripCompleted;
use App\Events\TripStarted;
use App\Events\WalletTopupCompleted;
use App\Services\Notification\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

final class NotifyEventListener implements ShouldQueue
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(object $event): void
    {
        $userId = $this->resolveUserId($event);
        $template = $this->resolveTemplate($event);

        if ($userId === null || $template === null) {
            return;
        }

        $this->notifications->createForUser(
            $userId,
            $template['title'] ?? 'Notification',
            $template['body'] ?? '',
            $template['data'] ?? [],
            $template['channel'] ?? 'in_app',
            $template['subject'] ?? null,
        );
    }

    private function resolveUserId(object $event): ?string
    {
        return match (get_class($event)) {
            BookingCreated::class,
            TripStarted::class,
            TripCompleted::class,
            PaymentSucceeded::class,
            PaymentFailed::class => $event->booking->user_id ?? $event->trip->user_id ?? $event->payment->user_id ?? null,

            DriverAssigned::class,
            DriverApproved::class => $event->driver->user_id ?? null,

            WalletTopupCompleted::class => $event->wallet->user_id ?? null,

            CustomerRegistered::class => $event->user->id ?? null,

            default => null,
        };
    }

    private function resolveTemplate(object $event): ?array
    {
        $type = class_basename($event);

        $templates = [
            BookingCreated::class => [
                'title' => 'Booking Diterima',
                'body' => 'Booking baru telah dibuat.',
                'channel' => 'in_app',
            ],
            DriverAssigned::class => [
                'title' => 'Driver Ditemukan',
                'body' => 'Driver baru telah ditugaskan.',
                'channel' => 'in_app',
            ],
            TripStarted::class => [
                'title' => 'Trip Dimulai',
                'body' => 'Trip kamu sekarang berjalan.',
                'channel' => 'in_app',
            ],
            TripCompleted::class => [
                'title' => 'Trip Selesai',
                'body' => 'Trip telah selesai.',
                'channel' => 'in_app',
            ],
            PaymentSucceeded::class => [
                'title' => 'Pembayaran Berhasil',
                'body' => 'Pembayaran berhasil diproses.',
                'channel' => 'in_app',
            ],
            PaymentFailed::class => [
                'title' => 'Pembayaran Gagal',
                'body' => 'Ada masalah saat memproses pembayaran.',
                'channel' => 'in_app',
            ],
            WalletTopupCompleted::class => [
                'title' => 'Topup Berhasil',
                'body' => 'Saldomu sudah bertambah.',
                'channel' => 'in_app',
            ],
            CustomerRegistered::class => [
                'title' => 'Registrasi Berhasil',
                'body' => 'Selamat datang.',
                'channel' => 'in_app',
            ],
            DriverApproved::class => [
                'title' => 'Driver Disetujui',
                'body' => 'Akun driver kamu sudah disetujui.',
                'channel' => 'in_app',
            ],
        ];

        return $templates[$event::class] ?? null;
    }
}
