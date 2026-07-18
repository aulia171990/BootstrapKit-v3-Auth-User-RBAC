<?php

namespace App\Services\Payment;

use App\Repositories\Payment\PaymentMethodRepository;

class PaymentMethodService
{
    public function __construct(private PaymentMethodRepository $methods) {}

    public function available(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->methods->active();
    }
}
