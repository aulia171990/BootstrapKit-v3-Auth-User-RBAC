<?php

namespace App\Gateways\Payment;

final class PaymentGatewayResponse
{
    public function __construct(
        public bool $success,
        public string $status,
        public ?string $providerReference = null,
        public ?string $authorizationId = null,
        public ?array $raw = null,
        public ?string $failureReason = null,
    ) {}
}
