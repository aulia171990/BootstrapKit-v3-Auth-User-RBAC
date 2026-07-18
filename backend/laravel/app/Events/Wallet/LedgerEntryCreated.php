<?php

namespace App\Events\Wallet;

use App\Events\BaseEvent;

class LedgerEntryCreated extends BaseEvent
{
    public function __construct(public readonly \App\Models\Wallet\WalletLedgerEntry $entry) {}
}
