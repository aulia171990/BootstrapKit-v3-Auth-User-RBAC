<?php

namespace App\DTOs\Payment;

final class ChargeRequest
{
    public function __construct(
        public ?int $userId,
        public string $bookingId,
        public string $paymentMethod,
        public int $amount,
        public string $currency = 'IDR',
        public ?string $reference = null,
        public ?array $payload = null,
    ) {}
}
