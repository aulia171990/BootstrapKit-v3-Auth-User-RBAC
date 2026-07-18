<?php

namespace App\Repositories\Notification;

use App\Models\Notification\Notification;
use Illuminate\Contracts\Pagination\Paginator;

class NotificationRepository
{
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function paginateForUser(string $userId, int $perPage = 20): Paginator
    {
        return Notification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function unreadCountForUser(string $userId): int
    {
        return (int) Notification::where('user_id', $userId)->whereNull('read_at')->count();
    }

    public function markRead(string $id): void
    {
        $notification = Notification::where('id', $id)->first();

        if ($notification && $notification->read_at === null) {
            $notification->forceFill(['read_at' => now()])->save();
        }
    }

    public function markAllRead(string $userId): void
    {
        Notification::where('user_id', $userId)->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function findUnsentForRetry(string $channel = 'in_app'): array
    {
        return Notification::whereHas('deliveries', function ($q) use ($channel) {
            $q->where('channel', $channel)->where('status', '!=', 'delivered');
        })->get()->all();
    }
}
