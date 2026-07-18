<?php

namespace App\DTOs\Payment;

final class PaymentResult
{
    public function __construct(
        public bool $success,
        public ?string $status,
        public ?string $reference,
        public ?string $providerReference,
        public ?string $rawResponse,
    ) {}

    public static function success(string $reference, string $providerReference, array $raw): self
    {
        return new self(true, 'success', $reference, $providerReference, json_encode($raw));
    }

    public static function failure(string $status, array $raw): self
    {
        return new self(false, $status, null, null, json_encode($raw));
    }
}
