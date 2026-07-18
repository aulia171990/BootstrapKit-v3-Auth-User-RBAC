<?php

namespace App\Services\Wallet;

use App\Repositories\Wallet\WalletRepository;

class WalletLockService
{
    public function __construct(private WalletRepository $wallets) {}

    public function lockAmount(\App\Models\Wallet\Wallet $wallet, int $amount, ?string $reason = null, ?string $referenceType = null, ?string $referenceId = null): void
    {
        $wallet->held_balance += $amount;
        $wallet->save();
    }
}
