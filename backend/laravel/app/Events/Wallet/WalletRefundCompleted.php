<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class WalletRefundCompleted extends BaseEvent
{
    public function __construct(public readonly \App\Models\Wallet\WalletTransaction $transaction) {}
}
