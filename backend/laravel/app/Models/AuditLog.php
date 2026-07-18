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
    public const ACTION_DRIVER_CREATED    = 'driver_created';
    public const ACTION_DRIVER_APPROVED   = 'driver_approved';
    public const ACTION_DRIVER_REJECTED   = 'driver_rejected';
    public const ACTION_DRIVER_SUSPENDED  = 'driver_suspended';
    public const ACTION_VEHICLE_CHANGED   = 'vehicle_changed';
    public const ACTION_DOCUMENT_UPLOADED = 'document_uploaded';
    public const ACTION_DOCUMENT_APPROVED = 'document_approved';
    public const ACTION_DOCUMENT_REJECTED = 'document_rejected';
    public const ACTION_DISPATCH_STARTED  = 'dispatch_started';
    public const ACTION_DISPATCH_FAILED   = 'dispatch_failed';
    public const ACTION_DRIVER_OFFER_SENT = 'driver_offer_sent';
    public const ACTION_DRIVER_ASSIGNED   = 'driver_assigned';
    public const ACTION_TRIP_CREATED      = 'trip_created';
    public const ACTION_TRIP_STARTED      = 'trip_started';
    public const ACTION_TRIP_COMPLETED    = 'trip_completed';
    public const ACTION_TRIP_CANCELLED    = 'trip_cancelled';
    public const ACTION_TRIP_SOS          = 'trip_sos';
    public const ACTION_WALLET_CREATED      = "wallet_created";
    public const ACTION_WALLET_TOPUP        = "wallet_topup";
    public const ACTION_WALLET_WITHDRAWAL   = "wallet_withdrawal";
    public const ACTION_WALLET_TRANSFER      = "wallet_transfer";
    public const ACTION_WALLET_REFUND        = "wallet_refund";
    public const ACTION_WALLET_SETTLEMENT    = "wallet_settlement";
    public const ACTION_WALLET_ADJUSTMENT    = "wallet_adjustment";
    public const ACTION_LEDGER_ENTRY_CREATED = "ledger_entry_created";

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
