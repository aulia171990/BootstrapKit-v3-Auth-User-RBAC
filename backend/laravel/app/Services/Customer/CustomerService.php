<?php

namespace App\Services\Customer;

use App\Events\CustomerProfileUpdated;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerProfile;
use App\Models\User;
use App\Repositories\Customer\CustomerRepository;
use Illuminate\Support\Str;

class CustomerService
{
    public function __construct(private CustomerRepository $customers) {}

    public function profileFor(string $userId): CustomerProfile
    {
        return $this->customers->findByUserId($userId) ?? $this->autoCreate($userId);
    }

    public function ensureExists(string $userId): CustomerProfile
    {
        return $this->profileFor($userId);
    }

    private function autoCreate(string $userId): CustomerProfile
    {
        $code = strtoupper(Str::random(6));

        /** @var CustomerProfile|null $existing */
        $existing = CustomerProfile::where('referral_code', $code)->first();
        while ($existing !== null) {
            $code = strtoupper(Str::random(6));
            $existing = CustomerProfile::where('referral_code', $code)->first();
        }

        return $this->customers->createForUser($userId, [
            'verification_status' => 'pending',
            'status' => 'active',
            'referral_code' => $code,
        ]);
    }
}
