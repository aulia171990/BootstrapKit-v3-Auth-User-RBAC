<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDevice extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'device_id',
        'platform',
        'ip_address',
        'user_agent',
        'refresh_token',
        'last_seen',
        'revoked_at',
    ];

    protected $casts = [
        'last_seen'  => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function revoke(): void
    {
        $this->revoked_at = now();
        $this->save();
    }
}
