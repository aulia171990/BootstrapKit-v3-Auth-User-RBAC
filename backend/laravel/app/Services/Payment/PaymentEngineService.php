<?php

namespace App\Services\Payment;

use App\DTOs\Payment\ChargeRequest;
use App\DTOs\Payment\PaymentResult;
use App\DTOs\Payment\RefundRequest;
use App\Repositories\Payment\PaymentRepository;
use App\Repositories\Payment\PaymentWebhookRepository;

class PaymentEngineService
{
    public function __construct(
        private PaymentRepository $payments,
        private PaymentWebhookRepository $webhooks,
    ) {}
}

