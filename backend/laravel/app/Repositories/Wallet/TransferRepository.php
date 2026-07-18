<?php

namespace App\Repositories\Wallet;

use App\Models\Wallet\WalletTransfer;

class TransferRepository
{
    public function create(array $data): WalletTransfer
    {
        return WalletTransfer::create($data);
    }
}
