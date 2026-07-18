<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Immutable audit row for every authentication attempt. Used for IP logging,
 * per-IP rate limiting, and failed-login analysis. Never updated — insert only.
 */
class LoginAttempt extends Model
{
    public const TYPE_PASSWORD     = 'password';
    public const TYPE_OTP_REQUEST  = 'otp_request';
    public const TYPE_OTP_LOGIN    = 'otp_login';
    public const TYPE_RESET        = 'reset';

    protected $fillable = [
        'email',
        'ip_address',
        'success',
        'user_id',
        'type',
    ];

    protected $casts = [
        'success' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
