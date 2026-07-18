<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ApiWebhookDelivery extends Model
{
    use HasUuids;

    protected $fillable = ['api_webhook_id', 'event', 'status', 'attempt', 'error', 'response', 'delivered_at', 'next_attempt_at'];

    protected $casts = [
        'delivered_at' => 'datetime',
        'next_attempt_at' => 'datetime',
    ];

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(ApiWebhook::class, 'api_webhook_id');
    }
}
