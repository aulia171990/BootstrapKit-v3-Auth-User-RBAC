<?php

namespace App\Services\Payment;

use App\Repositories\Payment\PaymentRepository;

class PaymentRefundService
{
    public function __construct(
        private PaymentRepository $payments,
        private PaymentGatewayService $gateway,
    ) {}

    public function execute(string $reference, ?string $reason = null): void
    {
        $transaction = $this->payments->findReference($reference);

        if (! $transaction) {
            return;
        }

        $this->gateway->refund($reference, $reason);

        $transaction->update([
            'status' => 'refunded',
            'failure_reason' => $reason,
            'processed_at' => now(),
        ]);
    }
}
