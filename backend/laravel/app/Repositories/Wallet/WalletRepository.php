<?php

namespace App\Repositories\Wallet;

use App\Models\Wallet\Wallet;

class WalletRepository
{
    public function find(string $ownerType, string $ownerId, string $walletType, string $currency = 'IDR'): ?Wallet
    {
        return Wallet::where('owner_type', $ownerType)
            ->where('owner_id', $ownerId)
            ->where('wallet_type', $walletType)
            ->where('currency', $currency)
            ->first();
    }

    public function create(array $data): Wallet
    {
        return Wallet::create($data);
    }
}
