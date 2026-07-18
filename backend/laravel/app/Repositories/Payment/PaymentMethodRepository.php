<?php

namespace App\Repositories\Payment;

use App\Models\Payment\PaymentMethod;

class PaymentMethodRepository
{
    public function active(): \Illuminate\Database\Eloquent\Collection
    {
        return PaymentMethod::where('active', true)->orderByDesc('priority')->get();
    }
}
