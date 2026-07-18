<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class WalletWithdrawalCompleted extends BaseEvent
{
    public function __construct(public readonly \App\Models\Wallet\WalletTransaction $transaction) {}
}
