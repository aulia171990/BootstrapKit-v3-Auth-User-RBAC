<?php

namespace App\Services\Wallet;

use App\Repositories\Wallet\WalletRepository;

class WalletService
{
    public function __construct(private WalletRepository $wallets) {}

    public function getOrCreate(string $ownerType, string $ownerId, string $walletType, string $currency = 'IDR'): \App\Models\Wallet\Wallet
    {
        $wallet = $this->wallets->find($ownerType, $ownerId, $walletType, $currency);

        if (! $wallet) {
            $wallet = $this->wallets->create([
                'owner_type' => $ownerType,
                'owner_id' => $ownerId,
                'wallet_type' => $walletType,
                'currency' => $currency,
                'status' => 'active',
            ]);
        }

        return $wallet;
    }
}
