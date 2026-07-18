<?php

namespace App\Services\Admin;

use App\Repositories\PaymentRepository;

class PaymentManagementService
{
    public function __construct(private PaymentRepository $payments) {}

    public function list(int $perPage = 20)
    {
        return $this->payments->paginate($perPage);
    }
}
