<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletAdjustment extends Model
{
    use HasUuids;

    protected $fillable = [
        'wallet_id',
        'wallet_transaction_id',
        'adjustment_type',
        'amount',
        'currency',
        'note',
        'performed_by_type',
        'performed_by_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}
