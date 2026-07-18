<?php

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotificationTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'name', 'locale', 'subject', 'body', 'data', 'channel', 'is_active',
    ];

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
    ];
}
