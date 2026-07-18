<?php

namespace App\DTOs\Wallet;

final class TransferRequest
{
    public function __construct(
        public string $fromWalletId,
        public string $toWalletId,
        public int $amount,
        public string $currency = 'IDR',
        public ?string $type = 'internal_transfer',
        public ?array $meta = null,
    ) {}
}
