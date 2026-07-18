<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Model implements JWTSubject, AuthenticatableContract, CanResetPasswordContract
{
    use HasUuids;
    use SoftDeletes;
    use Authenticatable;
    use HasFactory;
    use CanResetPassword;

    // Account status
    public const STATUS_ACTIVE = 1;
    public const STATUS_SUSPENDED = 0;   // disabled by admin, cannot log in
    public const STATUS_BANNED = -1;     // hard block

    // Brute-force lockout policy
    public const MAX_FAILED_ATTEMPTS = 5;
    public const LOCKOUT_MINUTES = 15;
    // Exponential backoff: penalty for the Nth consecutive failure is
    // BACKOFF_BASE * 2^(N-1) minutes, capped at LOCKOUT_MINUTES.
    public const BACKOFF_BASE_MINUTES = 1;

    // Default role for self-registration — never privileged.
    public const DEFAULT_ROLE = 'customer';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'status',
        'email_verified',
        'phone_verified',
        'last_login_at',
        'failed_login_attempts',
        'locked_until',
        'security_stamp',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'security_stamp',
    ];

    protected $casts = [
        'email_verified'        => 'boolean',
        'phone_verified'        => 'boolean',
        'last_login_at'         => 'datetime',
        'locked_until'          => 'datetime',
        'failed_login_attempts' => 'integer',
        'status'                => 'integer',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole(string ...$names): bool
    {
        return $this->roles()->whereIn('name', $names)->exists();
    }

    public function hasPermission(string $code): bool
    {
        return $this->roles()
            ->whereHas('permissions', fn ($q) => $q->where('code', $code))
            ->exists();
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class);
    }

    public function verificationTokens(): HasMany
    {
        return $this->hasMany(VerificationToken::class);
    }

    // ── Auth helpers ──────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function registerFailedLogin(): void
    {
        $attempts = ($this->failed_login_attempts ?? 0) + 1;

        if ($attempts >= self::MAX_FAILED_ATTEMPTS) {
            // Hard lockout: full LOCKOUT_MINUTES, reset the counter.
            $this->locked_until = now()->addMinutes(self::LOCKOUT_MINUTES);
            $this->failed_login_attempts = 0;
        } else {
            // Exponential backoff: penalty doubles per consecutive failure,
            // capped at the hard-lockout window. 1→1m, 2→2m, 3→4m, 4→8m …
            $penalty = min(
                self::LOCKOUT_MINUTES,
                self::BACKOFF_BASE_MINUTES * (2 ** ($attempts - 1))
            );
            $this->locked_until = now()->addMinutes($penalty);
            $this->failed_login_attempts = $attempts;
        }

        $this->save();
    }

    public function clearFailedLogin(): void
    {
        if ($this->failed_login_attempts !== 0 || $this->locked_until !== null) {
            $this->failed_login_attempts = 0;
            $this->locked_until = null;
            $this->save();
        }
    }

    public function recordLogin(): void
    {
        $this->last_login_at = now();
        $this->save();
    }

    /**
     * Rotate the security stamp. Any previously issued JWTs embedding the old
     * stamp become invalid (logout-everywhere). Returns the new stamp.
     */
    public function regenerateStamp(): string
    {
        $this->security_stamp = bin2hex(random_bytes(16));
        $this->save();

        return $this->security_stamp;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'  => $this->roles()->pluck('name')->first(),
            'act'   => $this->status === self::STATUS_ACTIVE ? 'user' : 'blocked',
            'stamp' => $this->security_stamp,
        ];
    }
}
