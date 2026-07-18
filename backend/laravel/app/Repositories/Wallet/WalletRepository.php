<?php

namespace App\Repositories\Wallet;

use App\Models\Wallet\Wallet;

class WalletRepository
{
    public function find(string $ownerType, string $ownerId, string $walletType, string $currency = 'IDR'): ?Wallet
    {
        return Wallet::where(compact('owner_type', 'owner_id', 'wallet_type', 'currency'))
            ->first();
    }

    public function create(array $data): Wallet
    {
        return Wallet::create($data);
    }
}
