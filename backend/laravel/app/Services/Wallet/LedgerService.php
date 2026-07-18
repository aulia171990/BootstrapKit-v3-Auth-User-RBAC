<?php

namespace App\Services\Wallet;

use App\DTOs\Wallet\LedgerEntry;
use App\Repositories\Wallet\LedgerRepository;
use Illuminate\Support\Facades\DB;

class LedgerService
{
    public function __construct(private LedgerRepository $ledgers) {}

    public function createEntry(string $walletId, LedgerEntry $dto): \App\Models\Wallet\WalletLedgerEntry
    {
        $entry = $this->ledgers->create([
            'wallet_id' => $walletId,
            'transaction_id' => $dto->transactionId,
            'entry_type' => $dto->entryType,
            'amount' => $dto->amount,
            'currency' => $dto->currency,
            'reference_type' => $dto->referenceType,
            'reference_id' => $dto->referenceId,
            'description' => $dto->description,
            'created_at' => now(),
        ]);

        return $entry;
    }

    public function sumDebits(string $walletId, ?string $transactionId = null): int
    {
        $q = \App\Models\Wallet\WalletLedgerEntry::where('wallet_id', $walletId)->where('entry_type', 'debit');

        if ($transactionId) {
            $q->where('transaction_id', $transactionId);
        }

        return (int) $q->sum('amount');
    }

    public function sumCredits(string $walletId, ?string $transactionId = null): int
    {
        $q = \App\Models\Wallet\WalletLedgerEntry::where('wallet_id', $walletId)->where('entry_type', 'credit');

        if ($transactionId) {
            $q->where('transaction_id', $transactionId);
        }

        return (int) $q->sum('amount');
    }
}
