<?php

namespace App\Gateways\Payment;

class CashlessGateway implements PaymentGatewayInterface
{
    public function charge(array $payload): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'paid', 'CASHLESS-'.uniqid());
    }

    public function authorize(array $payload): PaymentGatewayResponse
    {
        return new PaymentGatewayResponse(true, 'authorized', 'AUTH-'.uniqid(), 'AUTH-'.uniqid());
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
