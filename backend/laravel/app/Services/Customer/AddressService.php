<?php

namespace App\Services\Customer;

use App\Events\AddressAdded;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerAddress;
use App\Repositories\Customer\AddressRepository;
use App\Repositories\Customer\CustomerRepository;

class AddressService
{
    public function __construct(
        private CustomerRepository $customers,
        private AddressRepository $addresses,
    ) {}

    public function create(string $userId, array $data): CustomerAddress
    {
        $profile = $this->requireProfile($userId);

        if (($data['is_default'] ?? false) === true) {
            $this->resetDefault($profile->id);
        }

        $address = $this->addresses->create($profile->id, $data);

        AddressAdded::dispatch($address);

        return $address->fresh();
    }

    public function update(string $userId, string $addressId, array $data): CustomerAddress
    {
        $profile = $this->requireProfile($userId);

        if (($data['is_default'] ?? false) === true) {
            $this->resetDefault($profile->id);
        }

        $address = $this->addresses->update($profile->id, $addressId, $data);

        throw_unless($address, new \InvalidArgumentException('Alamat tidak ditemukan.'));

        return $address;
    }

    public function delete(string $userId, string $addressId): bool
    {
        $profile = $this->requireProfile($userId);

        return $this->addresses->delete($profile->id, $addressId);
    }

    public function list(string $userId): array
    {
        $profile = $this->requireProfile($userId);

        return $profile->addresses()->orderByDesc('is_default')->get()->all();
    }

    private function requireProfile(string $userId): \App\Models\Customer\CustomerProfile
    {
        $profile = $this->customers->findByUserId($userId);

        throw_unless($profile, new \InvalidArgumentException('Profil customer tidak ditemukan.'));

        return $profile;
    }

    private function resetDefault(string $customerProfileId): void
    {
        \App\Models\Customer\CustomerAddress::where('customer_profile_id', $customerProfileId)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}
