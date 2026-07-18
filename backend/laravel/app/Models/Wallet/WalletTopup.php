<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletTopup extends Model
{
    use HasUuids;

    protected $fillable = [
        'wallet_id',
        'wallet_transaction_id',
        'method',
        'provider_reference',
        'amount',
        'currency',
        'status',
        'failure_reason',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];
}
