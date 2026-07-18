<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletWithdrawal extends Model
{
    use HasUuids;

    protected $fillable = [
        'wallet_id',
        'wallet_transaction_id',
        'provider',
        'destination',
        'amount',
        'currency',
        'status',
        'processed_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];
}
