<?php

namespace App\Services\Payment;

class PaymentGatewayService
{
    public function charge(string $paymentMethod, int $amount, ?array $payload = null): array
    {
        // Placeholder gateway integration — always succeeds.
        return ['status' => 'success', 'provider_reference' => strtoupper($paymentMethod).'-'.uniqid()];
    }

    public function refund(string $reference, ?string $reason = null): array
    {
        return ['status' => 'refunded'];
    }
}
