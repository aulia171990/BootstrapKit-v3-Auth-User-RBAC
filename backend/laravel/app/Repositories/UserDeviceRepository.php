<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\UserDevice;

/**
 * Eloquent abstraction for the user_devices table.
 *
 * A "device" is (user_id, device_id). Each login/refresh upserts the row and
 * stamps it with the SHA-256 hash of the opaque refresh token it just issued,
 * so a device row and its refresh token are 1:1 and revocable together.
 *
 * `refresh_token` stores only the hash (never the plaintext), mirroring
 * RefreshTokenRepository.
 */
class UserDeviceRepository
{
    /**
     * Find-or-create the device row for this (user, device_id) and refresh its
     * session metadata + linked refresh-token hash. A previously-revoked row is
     * reactivated (re-login on the same device = a new, trusted session).
     */
    public function upsert(User $user, string $deviceId, array $meta, string $refreshTokenHash): UserDevice
    {
        $device = UserDevice::firstOrNew([
            'user_id'   => $user->id,
            'device_id' => $deviceId,
        ]);

        $device->platform     = $meta['platform'] ?? null;
        $device->ip_address   = $meta['ip_address'] ?? null;
        $device->user_agent   = $meta['user_agent'] ?? null;
        $device->refresh_token = $refreshTokenHash;
        $device->last_seen    = now();
        $device->revoked_at   = null; // reactivate if it was revoked

        $device->save();

        return $device;
    }

    /** Active devices for a user, most-recently-seen first. */
    public function forUser(User $user): array
    {
        return UserDevice::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->orderByDesc('last_seen')
            ->get()
            ->all();
    }

    /** Resolve the (active) device whose refresh_token hash matches. */
    public function findByRefreshTokenHash(string $hash): ?UserDevice
    {
        return UserDevice::where('refresh_token', $hash)
            ->whereNull('revoked_at')
            ->first();
    }

    public function revoke(UserDevice $device): void
    {
        $device->revoke();
    }

    public function revokeByRefreshTokenHash(string $hash): void
    {
        UserDevice::where('refresh_token', $hash)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /** Revoke every outstanding device for a user (used by logout-all / pw rotate). */
    public function revokeAllForUser(User $user): void
    {
        UserDevice::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }
}
