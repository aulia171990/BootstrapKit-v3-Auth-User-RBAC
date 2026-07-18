<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Immutable security/account audit row. One insert-only record per significant
 * event so the trail is trustworthy for forensics and compliance. Never updated.
 */
class AuditLog extends Model
{
    public const ACTION_LOGIN             = 'login';
    public const ACTION_LOGOUT            = 'logout';
    public const ACTION_LOGOUT_ALL        = 'logout_all';
    public const ACTION_REGISTER          = 'register';
    public const ACTION_PASSWORD_CHANGE   = 'password_change';
    public const ACTION_FAILED_LOGIN      = 'failed_login';
    public const ACTION_EMAIL_VERIFICATION = 'email_verification';
    public const ACTION_TOKEN_REFRESH     = 'token_refresh';

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'actor_email',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
