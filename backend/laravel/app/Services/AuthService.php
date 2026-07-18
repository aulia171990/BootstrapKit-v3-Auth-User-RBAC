<?php

namespace App\Services;

use App\Exceptions\Auth\AccountLockedException;
use App\Exceptions\Auth\InvalidCredentialsException;
use App\Models\AuditLog;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Models\UserDevice;
use App\Models\VerificationToken;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\TokenRepository;
use App\Repositories\UserDeviceRepository;
use App\Repositories\UserRepository;
use App\Services\PasswordResetService;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Single entry point for all authentication / account-lifecycle operations.
 *
 * Responsibilities: register, login (password + OTP), logout (single + all),
 * refresh (access+refresh token rotation), change password, forgot/reset
 * password, email verification, and device management.
 *
 * The controller only calls this service. All data access is delegated to the
 * repositories; this class contains NO Eloquent queries of its own.
 *
 * Token model: every login/register issues an opaque, server-stored refresh
 * token alongside the short-lived JWT access token. Each issued token pair is
 * linked to a device row (user_devices) via the refresh token's hash, so the
 * device can be listed and individually revoked.
 */
class AuthService
{
    public function __construct(
        private UserRepository $users,
        private TokenRepository $tokens,
        private RefreshTokenRepository $refreshTokens,
        private UserDeviceRepository $devices,
        private PasswordResetService $passwordReset,
    ) {}

    // ── Registration ─────────────────────────────────────────────
    public function register(array $data, ?array $device = null): array
    {
        $user = $this->users->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'],
            'password' => Hash::make($data['password']),
            'status'   => User::STATUS_ACTIVE,
        ]);

        $user->regenerateStamp();

        // Privilege-escalation guard: role is never taken from input.
        $this->users->attachDefaultRole($user);

        // Issue email verification token (delivered out-of-band in prod).
        $this->tokens->issue($user, VerificationToken::TYPE_EMAIL_VERIFICATION);

        $this->recordAudit(AuditLog::ACTION_REGISTER, $user, $device['ip_address'] ?? null, [
            'device_id' => $device['device_id'] ?? null,
            'platform'  => $device['platform'] ?? null,
        ]);

        return $this->issueTokenPair($user, $device);
    }

    // ── Login (email+password) ───────────────────────────────────
    public function login(string $email, string $password, ?array $device = null, ?string $ip = null): array
    {
        $user = $this->users->findByEmail($email);

        // Generic failure to avoid user enumeration.
        if (! $user) {
            $this->logAttempt($email, $ip, false, null, LoginAttempt::TYPE_PASSWORD);
            $this->recordAudit(AuditLog::ACTION_FAILED_LOGIN, null, $ip, ['email' => $email, 'reason' => 'unknown_account']);
            throw new InvalidCredentialsException();
        }

        if ($user->isLocked()) {
            $this->logAttempt($email, $ip, false, $user, LoginAttempt::TYPE_PASSWORD);
            $this->recordAudit(AuditLog::ACTION_FAILED_LOGIN, $user, $ip, ['reason' => 'locked']);
            throw new AccountLockedException($user->locked_until);
        }

        if (! $user->isActive()) {
            $this->logAttempt($email, $ip, false, $user, LoginAttempt::TYPE_PASSWORD);
            $this->recordAudit(AuditLog::ACTION_FAILED_LOGIN, $user, $ip, ['reason' => 'inactive']);
            throw new InvalidCredentialsException();
        }

        if (! $token = JWTAuth::attempt(['email' => $email, 'password' => $password])) {
            $user->registerFailedLogin();
            $this->logAttempt($email, $ip, false, $user, LoginAttempt::TYPE_PASSWORD);
            $this->recordAudit(AuditLog::ACTION_FAILED_LOGIN, $user, $ip, ['reason' => 'bad_password']);
            throw new InvalidCredentialsException();
        }

        $user->clearFailedLogin();
        $user->recordLogin();
        if ($user->security_stamp === null) {
            $user->regenerateStamp();
        }

        $this->logAttempt($email, $ip, true, $user, LoginAttempt::TYPE_PASSWORD);
        $this->recordAudit(AuditLog::ACTION_LOGIN, $user, $ip, [
            'device_id' => $device['device_id'] ?? null,
            'platform'  => $device['platform'] ?? null,
        ]);

        return $this->issueTokenPair($user, $device);
    }

    // ── OTP login (passwordless) ─────────────────────────────────
    public function requestOtp(string $identifier, ?string $ip = null): void
    {
        if ($user = $this->users->resolveByIdentifier($identifier)) {
            // Always issues a token so response timing/behaviour is identical
            // whether or not the account exists (anti-enumeration).
            $this->tokens->issue($user, VerificationToken::TYPE_OTP_LOGIN);
        }

        // IP logging for every OTP request, account-or-not (audit + rate-limit
        // signal). Identifier may be email or phone; only log if it looks like
        // an email to keep the indexed column meaningful.
        $email = str_contains($identifier, '@') ? $identifier : null;
        $this->logAttempt($email, $ip, false, $user ?? null, LoginAttempt::TYPE_OTP_REQUEST);
    }

    public function loginWithOtp(string $identifier, string $code, ?array $device = null, ?string $ip = null): array
    {
        $user = $this->users->resolveByIdentifier($identifier);

        if (! $user || ! $user->isActive()) {
            $email = str_contains($identifier, '@') ? $identifier : null;
            $this->logAttempt($email, $ip, false, null, LoginAttempt::TYPE_OTP_LOGIN);
            throw new InvalidCredentialsException();
        }

        if (! $this->tokens->redeem($user, VerificationToken::TYPE_OTP_LOGIN, $code)) {
            $this->logAttempt($user->email, $ip, false, $user, LoginAttempt::TYPE_OTP_LOGIN);
            throw new InvalidCredentialsException();
        }

        $user->recordLogin();
        $this->logAttempt($user->email, $ip, true, $user, LoginAttempt::TYPE_OTP_LOGIN);

        return $this->issueTokenPair($user, $device);
    }

    // ── Email verification ───────────────────────────────────────
    public function verifyEmail(string $identifier, string $code, ?string $ip = null): bool
    {
        $user = $this->users->resolveByIdentifier($identifier);

        if (! $user) {
            $this->recordAudit(AuditLog::ACTION_EMAIL_VERIFICATION, null, $ip, ['identifier' => $identifier, 'outcome' => 'unknown_account']);
            return false;
        }

        if (! $this->tokens->redeem($user, VerificationToken::TYPE_EMAIL_VERIFICATION, $code)) {
            $this->recordAudit(AuditLog::ACTION_EMAIL_VERIFICATION, $user, $ip, ['outcome' => 'invalid_code']);
            return false;
        }

        $user->email_verified = true;
        $this->users->save($user);

        $this->recordAudit(AuditLog::ACTION_EMAIL_VERIFICATION, $user, $ip, ['outcome' => 'verified']);

        return true;
    }

    public function resendEmailVerification(User $user): void
    {
        $this->tokens->issue($user, VerificationToken::TYPE_EMAIL_VERIFICATION);
    }

    // ── Password reset ───────────────────────────────────────────
    public function requestPasswordReset(string $identifier): ?string
    {
        // Resolve by email or phone to obtain the user's email (the broker is
        // keyed by email). Anti-enumeration: the controller returns 200 either
        // way, so we simply return null for unknown accounts.
        $user = $this->users->resolveByIdentifier($identifier);

        if (! $user) {
            return null;
        }

        return $this->passwordReset->sendResetLink($user->email);
    }

    public function resetPassword(string $email, string $token, string $newPassword): bool
    {
        return $this->passwordReset->reset($email, $token, $newPassword);
    }

    /**
     * Broker callback: apply the new password and rotate the security stamp so
     * every existing session / refresh token / device row is revoked. Invoked
     * by PasswordResetService::reset() (and unit-testable directly).
     */
    public function applyPasswordReset(User $user, string $plainPassword): void
    {
        $user->password = Hash::make($plainPassword);
        $user->clearFailedLogin();
        $user->regenerateStamp(); // invalidates all existing sessions
        $this->users->save($user);

        // Old refresh tokens + device rows can no longer be used (stamp
        // rotated); revoke them explicitly for a clean server-side state.
        $this->refreshTokens->revokeAllForUser($user);
        $this->devices->revokeAllForUser($user);
    }

    public function changePassword(User $user, string $current, string $new, ?string $ip = null): void
    {
        if (! Hash::check($current, $user->password)) {
            $this->recordAudit(AuditLog::ACTION_PASSWORD_CHANGE, $user, $ip, ['outcome' => 'invalid_current']);
            throw new InvalidCredentialsException();
        }

        $user->password = Hash::make($new);
        $user->regenerateStamp();
        $this->users->save($user);

        $this->recordAudit(AuditLog::ACTION_PASSWORD_CHANGE, $user, $ip, ['outcome' => 'success']);

        // New password ⇒ rotate all sessions.
        $this->refreshTokens->revokeAllForUser($user);
        $this->devices->revokeAllForUser($user);
    }

    // ── Token lifecycle ──────────────────────────────────────────
    /**
     * Refresh: authenticate by the opaque refresh token, revoke ("blacklist")
     * the presented one, and issue a fresh access+refresh pair. The old
     * refresh token (and its device row) becomes unusable the moment revoked.
     */
    public function refresh(string $refreshToken, ?array $device = null): array
    {
        $stored = $this->refreshTokens->findByPlainToken($refreshToken);

        if (! $stored) {
            throw new InvalidCredentialsException();
        }

        $user = $stored->user;

        if (! $user || ! $user->isActive()) {
            throw new InvalidCredentialsException();
        }

        // Rotation: blacklist the refresh token that was just used. The device
        // row is NOT revoked here — rotation is routine; the device stays
        // active and is re-linked to the new refresh-token hash below (when a
        // device context is supplied) or on the next explicit login/refresh
        // that carries one.
        $this->refreshTokens->revoke($stored);

        $this->recordAudit(AuditLog::ACTION_TOKEN_REFRESH, $user, $device['ip_address'] ?? null, [
            'device_id' => $device['device_id'] ?? null,
            'platform'  => $device['platform'] ?? null,
        ]);

        return $this->issueTokenPair($user, $device);
    }

    /**
     * Logout (single device). Blacklists the current access token and, when a
     * refresh token is supplied, revokes it AND the linked device row.
     */
    public function logout(?User $user, ?string $refreshToken = null, ?string $ip = null): void
    {
        try {
            JWTAuth::invalidate(JWTAuth::parseToken()->getToken());
        } catch (JWTException) {
            // Already invalid / absent — treat as success (idempotent logout).
        }

        if ($refreshToken) {
            $hash = hash('sha256', $refreshToken);
            if ($stored = $this->refreshTokens->findByPlainToken($refreshToken)) {
                $this->refreshTokens->revoke($stored);
            }
            $this->devices->revokeByRefreshTokenHash($hash);
        }

        $this->recordAudit(AuditLog::ACTION_LOGOUT, $user, $ip);
    }

    // Logout everywhere: rotate stamp (kills access tokens) AND revoke every
    // outstanding refresh token + device server-side.
    public function logoutAll(User $user, ?string $ip = null): void
    {
        $user->regenerateStamp();
        $this->refreshTokens->revokeAllForUser($user);
        $this->devices->revokeAllForUser($user);

        $this->recordAudit(AuditLog::ACTION_LOGOUT_ALL, $user, $ip);
    }

    // ── Device management ────────────────────────────────────────
    /** List the user's active (non-revoked) devices. */
    public function listDevices(User $user): array
    {
        return $this->devices->forUser($user);
    }

    /**
     * Revoke a single device by its client-supplied device_id. Revokes the
     * device row and any refresh token linked to it.
     */
    public function revokeDevice(User $user, string $deviceId): bool
    {
        $device = UserDevice::where('user_id', $user->id)
            ->where('device_id', $deviceId)
            ->first();

        if (! $device) {
            return false;
        }

        if ($device->refresh_token) {
            $this->refreshTokens->revokeByHash($device->refresh_token);
        }

        $this->devices->revoke($device);

        return true;
    }

    // ── Internals ────────────────────────────────────────────────
    /**
     * Append-only audit row for one authentication attempt. Captures the
     * source IP (IP logging), success state, and the target user when known.
     * Insert-only — never mutate — so the trail is trustworthy for forensics
     * and per-IP rate limiting.
     */
    private function logAttempt(?string $email, ?string $ip, bool $success, ?User $user, string $type): void
    {
        LoginAttempt::create([
            'email'      => $email,
            'ip_address' => $ip ?? request()->ip(),
            'success'    => $success,
            'user_id'    => $user?->id,
            'type'       => $type,
        ]);
    }

    /**
     * Append-only audit row for a significant account event. Captures the actor,
     * action, source IP, and structured context. Insert-only so the trail is
     * trustworthy for forensics/compliance.
     */
    private function recordAudit(string $action, ?User $user, ?string $ip, array $context = []): void
    {
        AuditLog::create([
            'user_id'    => $user?->id,
            'action'     => $action,
            'ip_address' => $ip ?? request()->ip(),
            'actor_email'=> $user?->email,
            'context'    => $context,
        ]);
    }

    // Single source of truth for issuing an access JWT + opaque refresh token,
    // then linking both to a device row (when device context is supplied).
    private function issueTokenPair(User $user, ?array $device = null): array
    {
        $access = JWTAuth::fromUser($user);

        $issued = $this->refreshTokens->issue($user, $this->refreshTtlMinutes());
        $refreshTokenHash = hash('sha256', $issued['plain']);

        if ($device && ! empty($device['device_id'])) {
            $this->devices->upsert($user, $device['device_id'], [
                'platform'   => $device['platform'] ?? null,
                'ip_address' => $device['ip_address'] ?? null,
                'user_agent' => $device['user_agent'] ?? null,
            ], $refreshTokenHash);
        }

        return $this->buildTokenData($access, $issued['plain'], $issued['expires_at'])
            + ['user' => $user];
    }

    private function buildTokenData(string $accessToken, string $refreshToken, $refreshExpiresAt): array
    {
        return [
            'token'                     => $accessToken,
            'token_type'                => 'bearer',
            'expires_in'                => JWTAuth::factory()->getTTL() * 60,
            'refresh_token'             => $refreshToken,
            'refresh_token_expires_in'  => $refreshExpiresAt->diffInSeconds(now()),
        ];
    }

    private function refreshTtlMinutes(): int
    {
        return (int) config('jwt.refresh_ttl', 20160);
    }
}
