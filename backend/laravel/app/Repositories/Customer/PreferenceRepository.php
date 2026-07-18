<?php

namespace App\Repositories\Customer;

use App\Models\Customer\CustomerPreference;

class PreferenceRepository
{
    public function findByCustomerId(string $customerProfileId): ?CustomerPreference
    {
        return CustomerPreference::where('customer_profile_id', $customerProfileId)->first();
    }

    public function create(string $customerProfileId, array $data): CustomerPreference
    {
        return CustomerPreference::create(array_merge($data, ['customer_profile_id' => $customerProfileId]));
    }

    public function update(string $customerProfileId, array $data): CustomerPreference
    {
        $preference = $this->findByCustomerId($customerProfileId);

        if ($preference) {
            $preference->forceFill($data)->save();
        }

        return $preference->fresh();
    }
}
