<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletRefund extends Model
{
    use HasUuids;

    protected $fillable = [
        'wallet_id',
        'wallet_transaction_id',
        'original_transaction_id',
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
