<?php

namespace App\Repositories\Payment;

use App\Models\Payment\PaymentWebhookLog;

class PaymentWebhookRepository
{
    public function create(array $data): PaymentWebhookLog
    {
        return PaymentWebhookLog::create($data);
    }

    public function markProcessed(PaymentWebhookLog $log): PaymentWebhookLog
    {
        $log->update(['status' => 'processed', 'processed_at' => now()]);

        return $log;
    }

    public function markFailed(PaymentWebhookLog $log, string $error): PaymentWebhookLog
    {
        $log->update(['status' => 'failed', 'error' => $error]);

        return $log;
    }
}
