<?php

namespace App\Gateways\Payment;

class CashGateway implements PaymentGatewayInterface
{
    public function charge(array $payload): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'paid', 'CASH-'.uniqid());
    }

    public function authorize(array $payload): PaymentGatewayResponse
    {
        return $this->charge($payload);
    }

    public function capture(string $authorizationId, ?int $amount = null): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'paid', $authorizationId);
    }

    public function refund(string $transactionId, ?int $amount = null, ?string $reason = null): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'refunded', $transactionId, null, ['amount' => $amount, 'reason' => $reason]);
    }

    public function void(string $transactionId): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'cancelled', $transactionId);
    }

    public function getStatus(string $transactionId): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'paid', $transactionId);
    }
}
