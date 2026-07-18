<?php

namespace App\Services;

use App\Models\User;

class BookingValidationService
{
    public function ensureCustomerCanBook(User $customer): void
    {
        if (! $customer->email_verified) {
            throw new \InvalidArgumentException('Email belum diverifikasi.');
        }

        if ($customer->hasRole('driver')) {
            throw new \InvalidArgumentException('Akun driver tidak dapat membuat booking.');
        }

        if (($customer->status ?? 1) !== 1) {
            throw new \InvalidArgumentException('Akun tidak aktif.');
        }
    }
}
