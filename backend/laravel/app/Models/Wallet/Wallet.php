<?php

namespace App\Models\Wallet;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_type',
        'owner_id',
        'wallet_type',
        'currency',
        'status',
        'available_balance',
        'held_balance',
    ];

    protected $casts = [
        'available_balance' => 'decimal:2',
        'held_balance' => 'decimal:2',
    ];

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(\App\Models\Wallet\WalletLedgerEntry::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(\App\Models\Wallet\WalletTransaction::class);
    }

    public function locks(): HasMany
    {
        return $this->hasMany(\App\Models\Wallet\WalletLock::class);
    }
}
