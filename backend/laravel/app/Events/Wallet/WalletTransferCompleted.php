<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class WalletTransferCompleted extends BaseEvent
{
    public function __construct(public readonly \App\Models\Wallet\WalletTransfer $transfer) {}
}
