<?php

namespace App\Services\Payment;

use App\Models\Payment\PaymentWebhookLog;
use App\Repositories\Payment\PaymentWebhookRepository;

class PaymentWebhookService
{
    public function __construct(private PaymentWebhookRepository $webhooks) {}

    public function ingest(string $provider, string $event, string $payload, ?string $signature = null): PaymentWebhookLog
    {
        $log = $this->webhooks->create([
            'provider' => $provider,
            'event' => $event,
            'signature' => $signature,
            'payload' => json_decode($payload, true) ?: [],
        ]);

        return $log;
    }
}
