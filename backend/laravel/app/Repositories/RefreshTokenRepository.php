<?php

namespace App\Repositories;

use App\Models\RefreshToken;
use App\Models\User;

/**
 * Eloquent abstraction for opaque refresh tokens.
 *
 * Refresh tokens are random 64-char hex strings. We store only their SHA-256
 * hash (so a DB leak does not expose usable tokens). The plaintext is returned
 * to the client exactly once, at issuance.
 */
class RefreshTokenRepository
{
    public function issue(User $user, int $ttlMinutes): array
    {
        $plain = bin2hex(random_bytes(32)); // 64 hex chars
        $hash = hash('sha256', $plain);

        $model = RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => $hash,
            'expires_at' => now()->addMinutes($ttlMinutes),
        ]);

        return [
            'plain'      => $plain,
            'expires_at' => $model->expires_at,
        ];
    }

    /**
     * Resolve a usable (not revoked, not expired) refresh token by its
     * plaintext value. Returns null on miss / revoke / expiry.
     */
    public function findByPlainToken(string $plain): ?RefreshToken
    {
        $hash = hash('sha256', $plain);

        return RefreshToken::where('token', $hash)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    public function revoke(RefreshToken $token): void
    {
        $token->revoke();
    }

    /** Revoke a refresh token by its stored SHA-256 hash (e.g. from device row). */
    public function revokeByHash(string $hash): void
    {
        RefreshToken::where('token', $hash)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Revoke every outstanding refresh token for a user — used by logout-all
     * so the rotation is enforced server-side, not only via the JWT stamp.
     */
    public function revokeAllForUser(User $user): void
    {
        RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }
}
