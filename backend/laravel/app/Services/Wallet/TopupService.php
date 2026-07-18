<?php

namespace App\Services\Wallet;

use App\DTOs\Wallet\TransactionRequest;
use App\Repositories\Wallet\TransactionRepository;

class TopupService
{
    public function __construct(private TransactionRepository $transactions) {}

    public function execute(TransactionRequest $request): \App\Models\Wallet\WalletTransaction
    {
        return $this->transactions->create([
            'wallet_id' => $request->walletId,
            'type' => 'topup',
            'status' => 'pending',
            'amount' => $request->amount,
            'currency' => $request->currency,
            'reference_type' => $request->referenceType,
            'reference_id' => $request->referenceId,
            'meta' => $request->meta,
        ]);
    }
}
