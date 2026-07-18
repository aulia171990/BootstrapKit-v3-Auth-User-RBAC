<?php

namespace App\Services\Wallet;

use App\Repositories\Wallet\WalletRepository;

class BalanceService
{
    public function __construct(private WalletRepository $wallets) {}

    public function calculate(string $walletId): array
    {
        $ledgerService = new LedgerService(new \App\Repositories\Wallet\LedgerRepository());

        $availableCredits = $ledgerService->sumCredits($walletId);
        $availableDebits = $ledgerService->sumDebits($walletId);
        $heldDebits = 0;

        return [
            'available_balance' => max(0, $availableCredits - $availableDebits),
            'held_balance' => $heldDebits,
        ];
    }
}
