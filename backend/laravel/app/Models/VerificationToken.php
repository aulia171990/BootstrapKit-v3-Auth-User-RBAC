<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationToken extends Model
{
    use HasUuids;

    public const TYPE_EMAIL_VERIFICATION = 'email_verification';
    public const TYPE_PHONE_VERIFICATION = 'phone_verification';
    public const TYPE_OTP_LOGIN          = 'otp_login';
    public const TYPE_PASSWORD_RESET     = 'password_reset';

    // Tokens older than this are invalid even if not yet "consumed".
    public const TTL_MINUTES = 10;

    protected $fillable = [
        'user_id',
        'type',
        'code',
        'expires_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at'  => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isUsable(): bool
    {
        return $this->consumed_at === null && $this->expires_at->isFuture();
    }

    public function consume(): void
    {
        $this->consumed_at = now();
        $this->save();
    }
}
