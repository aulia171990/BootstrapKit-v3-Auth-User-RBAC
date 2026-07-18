<?php

namespace App\Repositories\Payment;

use App\Models\Payment\PaymentTransaction;

class PaymentTransactionRepository
{
    public function list(array $filters = [], int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return PaymentTransaction::query()
            ->with('paymentMethod')
            ->when($filters['booking_id'] ?? null, fn ($q, $v) => $q->where('booking_id', $v))
            ->when($filters['trip_id'] ?? null, fn ($q, $v) => $q->where('trip_id', $v))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
