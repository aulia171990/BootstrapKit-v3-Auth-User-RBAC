<?php

namespace App\DTOs\Wallet;

final class LedgerEntry
{
    public function __construct(
        public string $transactionId,
        public string $entryType,
        public int $amount,
        public string $currency = 'IDR',
        public ?string $referenceType = null,
        public ?string $referenceId = null,
        public ?string $description = null,
    ) {}
}
