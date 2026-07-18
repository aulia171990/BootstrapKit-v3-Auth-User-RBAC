<?php

namespace App\Services\Admin;

use App\Repositories\WalletRepository;

class WalletManagementService
{
    public function __construct(private WalletRepository $wallets) {}

    public function list(int $perPage = 20)
    {
        return $this->wallets->paginate($perPage);
    }
}
