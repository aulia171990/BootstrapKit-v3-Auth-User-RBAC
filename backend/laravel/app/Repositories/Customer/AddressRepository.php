<?php

namespace App\Repositories\Customer;

use App\Models\Customer\CustomerAddress;

class AddressRepository
{
    public function create(string $customerProfileId, array $data): CustomerAddress
    {
        return CustomerAddress::create(array_merge($data, ['customer_profile_id' => $customerProfileId]));
    }

    public function findForCustomer(string $customerProfileId, string $addressId): ?CustomerAddress
    {
        return CustomerAddress::where('customer_profile_id', $customerProfileId)->where('id', $addressId)->first();
    }

    public function update(string $customerProfileId, string $addressId, array $data): CustomerAddress
    {
        $address = $this->findForCustomer($customerProfileId, $addressId);

        if ($address) {
            $address->forceFill($data)->save();
        }

        return $address->fresh();
    }

    public function delete(string $customerProfileId, string $addressId): bool
    {
        $address = $this->findForCustomer($customerProfileId, $addressId);

        return $address ? $address->delete() : false;
    }
}
