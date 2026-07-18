<?php

namespace App\Services;

use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Support\Facades\Password;

/**
 * Thin wrapper around Laravel's Password Broker for the JWT API.
 *
 * The broker owns token issuance / expiry / throttle and stores hashed tokens
 * in `password_reset_tokens`. Because this is a token API (no email transport
 * in the demo), sendResetLink() returns the plaintext broker token so the
 * caller can deliver it out-of-band; reset() validates + rotates the user's
 * password and security stamp (which revokes all sessions).
 */
class PasswordResetService
{
    /** Issue a reset token for the email. Returns plaintext token (or null if no such user). */
    public function sendResetLink(string $email): ?string
    {
        $user = Password::broker()->getUser(['email' => $email]);

        if (! $user instanceof CanResetPasswordContract) {
            return null;
        }

        // createToken() generates a random plaintext, hashes + stores it, and
        // returns the plaintext. That is exactly what the API client must echo
        // back to /auth/password/reset.
        return Password::broker()->createToken($user);
    }

    /** Reset the password. Returns true on success, false on invalid/expired token. */
    public function reset(string $email, string $token, string $password): bool
    {
        $status = Password::reset(
            [
                'email'                 => $email,
                'token'                 => $token,
                'password'              => $password,
                'password_confirmation' => $password,
            ],
            function (CanResetPasswordContract $user, string $plain) {
                // Delegate the write to AuthService so password hashing +
                // security-stamp rotation (revokes all sessions) stay in one
                // place.
                app(AuthService::class)->applyPasswordReset($user, $plain);
            }
        );

        return $status === Password::PASSWORD_RESET;
    }
}
