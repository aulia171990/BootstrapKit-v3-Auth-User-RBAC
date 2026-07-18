<?php

namespace App\Repositories\Wallet;

use App\Models\Wallet\WalletTransaction;

class TransactionRepository
{
    public function create(array $data): WalletTransaction
    {
        return WalletTransaction::create($data);
    }

    public function findReference(string $referenceId): ?WalletTransaction
    {
        return WalletTransaction::where('reference_id', $referenceId)->first();
    }
}
