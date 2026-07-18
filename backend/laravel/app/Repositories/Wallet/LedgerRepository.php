<?php

namespace App\Repositories\Wallet;

use App\Models\Wallet\WalletLedgerEntry;

class LedgerRepository
{
    public function create(array $data): WalletLedgerEntry
    {
        return WalletLedgerEntry::create($data);
    }

    public function exists(string $transactionId, string $entryType): bool
    {
        return WalletLedgerEntry::where('transaction_id', $transactionId)
            ->where('entry_type', $entryType)
            ->exists();
    }
}
