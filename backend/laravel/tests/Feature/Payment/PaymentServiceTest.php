<?php

namespace Tests\Feature\Payment;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    #[Test]
    public function cash_gateway_returns_paid_response(): void
    {
        $gateway = new \App\Gateways\Payment\CashGateway();
        $response = $gateway->charge([]);

        $this->assertInstanceOf(\App\Gateways\Payment\PaymentGatewayResponse::class, $response);
        $this->assertTrue($response->success);
        $this->assertSame('paid', $response->status);
    }

    #[Test]
    public function cashless_gateway_returns_authorized_response(): void
    {
        $gateway = new \App\Gateways\Payment\CashlessGateway();
        $response = $gateway->authorize([]);

        $this->assertInstanceOf(\App\Gateways\Payment\PaymentGatewayResponse::class, $response);
        $this->assertTrue($response->success);
        $this->assertSame('authorized', $response->status);
        $this->assertNotNull($response->authorizationId);
    }

    #[Test]
    public function webhook_service_ingests_payload(): void
    {
        $repo = new class extends \App\Repositories\Payment\PaymentWebhookRepository {
            public array $rows = [];
            public function create(array $data): \App\Models\Payment\PaymentWebhookLog
            {
                $data['status'] = 'pending';
                $model = new \App\Models\Payment\PaymentWebhookLog($data);
                $this->rows[] = $model;
                return $model;
            }
        };

        $service = new \App\Services\Payment\PaymentWebhookService($repo);

        $log = $service->ingest('dummy', 'payment.success', '{"ok": true}', 'sig');

        $this->assertSame('dummy', $log->provider);
        $this->assertSame('payment.success', $log->event);
        $this->assertSame('pending', $log->status);
    }
}
