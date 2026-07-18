<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\Notification\NotificationService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        return ApiResponse::success($this->notifications->listForUser((string) $user->id, (int) ($request->input('per_page', 20))));
    }

    public function unread(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        return ApiResponse::success(['unread_count' => $this->notifications->unreadCount((string) $user->id)]);
    }

    public function markRead(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        $validated = $request->validate([
            'notification_id' => ['required', 'string'],
        ]);

        $this->notifications->markRead((string) $user->id, (string) $validated['notification_id']);

        return ApiResponse::success(null, 'Notifikasi ditandai dibaca');
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        $this->notifications->markAllRead((string) $user->id);

        return ApiResponse::success(null, 'Semua notifikasi dibaca');
    }

    public function preferences(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        return ApiResponse::success($this->notifications->preferences((string) $user->id));
    }

    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AccessDeniedHttpException('Unauthenticated');
        }

        $validated = $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.*.channel' => ['required', 'string', 'max:50'],
            'preferences.*.enabled' => ['required', 'boolean'],
            'preferences.*.settings' => ['nullable', 'array'],
        ]);

        foreach ($validated['preferences'] as $item) {
            $this->notifications->updatePreference(
                (string) $user->id,
                $item['channel'],
                (bool) $item['enabled'],
                $item['settings'] ?? null,
            );
        }

        return ApiResponse::success($this->notifications->preferences((string) $user->id), 'Preferensi notifikasi diperbarui');
    }
}
