<?php

namespace App\DTOs\Wallet;

final class TransactionRequest
{
    public function __construct(
        public string $walletId,
        public string $type,
        public int $amount,
        public string $currency = 'IDR',
        public ?string $referenceType = null,
        public ?string $referenceId = null,
        public ?array $meta = null,
    ) {}
}
