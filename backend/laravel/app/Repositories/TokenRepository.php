<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\VerificationToken;

/**
 * Eloquent abstraction for VerificationToken (single-use, expiring tokens for
 * email/phone verification, OTP login, password reset).
 *
 * Replaces the former VerificationTokenService: all token persistence and
 * lookup now lives here so AuthService no longer performs Eloquent queries.
 */
class TokenRepository
{
    /**
     * Create a fresh token, invalidating any prior unconsumed tokens of the
     * same type for the user (prevents replay / token pile-up).
     */
    public function issue(User $user, string $type, ?string $code = null): VerificationToken
    {
        $user->verificationTokens()
            ->where('type', $type)
            ->whereNull('consumed_at')
            ->delete();

        return $user->verificationTokens()->create([
            'type'       => $type,
            'code'       => $code ?? $this->generateOtp(),
            'expires_at' => now()->addMinutes(VerificationToken::TTL_MINUTES),
        ]);
    }

    /**
     * Find a usable token for the user+type+code. Returns null when the code
     * is wrong, expired, or already consumed.
     */
    public function redeem(User $user, string $type, string $code): ?VerificationToken
    {
        $token = $user->verificationTokens()
            ->where('type', $type)
            ->where('code', $code)
            ->whereNull('consumed_at')
            ->first();

        if (! $token || ! $token->isUsable()) {
            return null;
        }

        $token->consume();

        return $token;
    }

    public function generateOtp(int $length = 6): string
    {
        $otp = '';
        for ($i = 0; $i < $length; $i++) {
            $otp .= (string) random_int(0, 9);
        }

        return $otp;
    }
}
