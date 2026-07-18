<?php

namespace App\Events\Payment;

use App\Events\BaseEvent;

class PaymentProcessed extends BaseEvent
{
    public function __construct(
        public readonly ?string $transactionReference,
        public readonly ?string $providerReference,
        public readonly bool $success,
    ) {}
}
