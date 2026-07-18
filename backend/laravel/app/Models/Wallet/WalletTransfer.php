<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletTransfer extends Model
{
    use HasUuids;

    protected $fillable = [
        'from_wallet_id',
        'to_wallet_id',
        'wallet_transaction_id',
        'type',
        'amount',
        'currency',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
    ];
}
