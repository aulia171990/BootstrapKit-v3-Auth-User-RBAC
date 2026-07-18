<?php

namespace Tests\Feature\Payment;

use App\Repositories\Payment\PaymentWebhookRepository;
use App\Services\Payment\PaymentWebhookService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    #[Test]
    public function webhook_service_accepted_ingest_creates_pending_logs(): void
    {
        $repo = new class extends PaymentWebhookRepository {
            public array $rows = [];
            public function create(array $data): \App\Models\Payment\PaymentWebhookLog
            {
                $data['status'] = 'pending';
                $model = new \App\Models\Payment\PaymentWebhookLog($data);
                $this->rows[] = $model;
                return $model;
            }
        };

        $service = new PaymentWebhookService($repo);
        $first = $service->ingest('dummy', 'payment.success', '{"ok":true}', 'sig');
        $second = $service->ingest('dummy', 'payment.success', '{"ok":true}', 'sig');

        $this->assertSame('dummy', $first->provider);
        $this->assertSame('pending', $first->status);
        $this->assertCount(2, $repo->rows);
    }
}
