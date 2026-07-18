<?php

namespace Tests\Feature\Payment;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentProviderRoutingTest extends TestCase
{
    #[Test]
    public function payment_gateway_service_returns_successful_charge_response(): void
    {
        $service = new \App\Services\Payment\PaymentGatewayService();
        $response = $service->charge('CASHLESS', 10000, ['currency' => 'IDR']);

        $this->assertIsArray($response);
        $this->assertSame('success', $response['status']);
        $this->assertStringStartsWith('CASHLESS-', $response['provider_reference']);
    }
}
