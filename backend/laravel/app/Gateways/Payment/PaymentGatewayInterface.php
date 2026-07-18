<?php

namespace App\Gateways\Payment;

interface PaymentGatewayInterface
{
    public function charge(array $payload): PaymentGatewayResponse;

    public function authorize(array $payload): PaymentGatewayResponse;

    public function capture(string $authorizationId, ?int $amount = null): PaymentGatewayResponse;

    public function refund(string $transactionId, ?int $amount = null, ?string $reason = null): PaymentGatewayResponse;

    public function void(string $transactionId): PaymentGatewayResponse;

    public function getStatus(string $transactionId): PaymentGatewayResponse;
}
