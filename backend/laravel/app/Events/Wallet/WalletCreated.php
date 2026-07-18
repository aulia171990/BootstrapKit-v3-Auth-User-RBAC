<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class WalletCreated extends BaseEvent
{
    public function __construct(public readonly \App\Models\Wallet\Wallet $wallet) {}
}
