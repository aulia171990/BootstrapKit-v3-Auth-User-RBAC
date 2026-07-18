<?php

namespace App\Models\Api;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiClient extends Model
{
    protected $fillable = ['user_id', 'name', 'type', 'status', 'allowed_scopes', 'allowed_ips', 'rate_limit', 'last_used_at'];

    protected $casts = [
        'allowed_scopes' => 'array',
        'allowed_ips' => 'array',
        'is_active' => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
