<?php

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotificationDelivery extends Model
{
    use HasUuids;

    public $timestamps = true;

    protected $fillable = [
        'notification_id', 'channel', 'status', 'provider', 'payload', 'response',
        'sent_at', 'failed_at', 'retry_count', 'error_code', 'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'response' => 'array',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
        'retry_count' => 'integer',
    ];

    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }
}
