<?php

namespace App\Repositories\Customer;

use App\Models\Customer\CustomerProfile;
use App\Models\User;

class CustomerRepository
{
    public function findByUserId(string $userId): ?CustomerProfile
    {
        return CustomerProfile::where('user_id', $userId)->first();
    }

    public function findOrFail(string $id): CustomerProfile
    {
        return CustomerProfile::findOrFail($id);
    }

    public function createForUser(string $userId, array $data = []): CustomerProfile
    {
        return CustomerProfile::create(array_merge($data, ['user_id' => $userId]));
    }

    public function createProfileForUser(User $user, array $data = []): CustomerProfile
    {
        return CustomerProfile::create(array_merge($data, ['user_id' => $user->id]));
    }
}
