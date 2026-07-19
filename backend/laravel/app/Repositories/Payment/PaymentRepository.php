<?php

namespace App\Repositories\Payment;

use App\Models\Payment\PaymentTransaction;

class PaymentRepository
{
    public function create(array $data): PaymentTransaction
    {
        return PaymentTransaction::create($data);
    }

    public function findReference(string $reference): ?PaymentTransaction
    {
        return PaymentTransaction::where('reference', $reference)->first();
    }

    public function paginate(int $perPage = 20)
    {
        return PaymentTransaction::orderByDesc('created_at')->paginate($perPage);
    }
}
