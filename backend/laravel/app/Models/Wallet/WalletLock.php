<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletLock extends Model
{
    use HasUuids;

    protected $fillable = [
        'wallet_id',
        'amount',
        'currency',
        'reason',
        'reference_type',
        'reference_id',
        'expires_at',
        'released_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'released_at' => 'datetime',
    ];
}
