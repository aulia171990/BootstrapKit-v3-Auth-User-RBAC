<?php

namespace App\DTOs\Payment;

final class RefundRequest
{
    public function __construct(
        public string $transactionReference,
        public int $amount,
        public ?string $reason = null,
        public ?array $payload = null,
    ) {}
}
