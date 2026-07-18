<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ApiWebhook extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = ['api_client_id', 'url', 'events', 'secret', 'headers', 'last_delivered_at', 'is_active'];

    protected $casts = [
        'events' => 'array',
        'headers' => 'array',
        'last_delivered_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(ApiClient::class, 'api_client_id');
    }
}
