<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class SettlementCompleted extends BaseEvent
{
    public function __construct(
        public readonly \App\Models\Wallet\WalletTransaction $platformTransaction,
        public readonly \App\Models\Wallet\WalletTransaction $driverTransaction,
    ) {}
}
