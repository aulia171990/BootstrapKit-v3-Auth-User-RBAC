<?php

namespace App\Services\Wallet;

use App\DTOs\Wallet\TransferRequest;
use App\Models\Wallet\Wallet;
use App\Repositories\Wallet\TransferRepository;
use Illuminate\Support\Facades\DB;

class TransferService
{
    public function __construct(private TransferRepository $transfers) {}

    public function execute(Wallet $fromWallet, Wallet $toWallet, TransferRequest $request): \App\Models\Wallet\WalletTransfer
    {
        return DB::transaction(function () use ($fromWallet, $toWallet, $request) {
            return $this->transfers->create([
                'from_wallet_id' => $fromWallet->id,
                'to_wallet_id' => $toWallet->id,
                'type' => $request->type,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'meta' => $request->meta,
            ]);
        });
    }
}
