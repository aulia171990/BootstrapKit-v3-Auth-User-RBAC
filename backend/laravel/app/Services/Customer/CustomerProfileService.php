<?php

namespace App\Services\Customer;

use App\Events\CustomerProfileUpdated;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerProfile;
use App\Repositories\Customer\CustomerRepository;

class CustomerProfileService
{
    public function __construct(private CustomerRepository $customers) {}

    public function update(string $userId, array $data): CustomerProfile
    {
        $profile = $this->validateProfileOwner($userId);

        $profile->forceFill($data)->save();

        CustomerProfileUpdated::dispatch($profile);

        return $profile->fresh();
    }

    public function show(string $userId): CustomerProfile
    {
        $profile = $this->customers->findByUserId($userId);

        throw_unless($profile, new \InvalidArgumentException('Profil customer tidak ditemukan.'));

        return $profile;
    }

    public function validateProfileOwner(string $userId): CustomerProfile
    {
        return $this->show($userId);
    }
}
