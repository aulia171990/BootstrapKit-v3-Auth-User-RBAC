<?php

namespace App\Services\Customer;

use App\Events\PreferenceUpdated;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerPreference;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Customer\PreferenceRepository;

class PreferenceService
{
    public function __construct(
        private CustomerRepository $customers,
        private PreferenceRepository $preferences,
    ) {}

    public function update(string $userId, array $data): CustomerPreference
    {
        $profile = $this->requireProfile($userId);

        $exists = $this->preferences->findByCustomerId($profile->id);

        if ($exists) {
            $preference = $this->preferences->update($profile->id, $data);
        } else {
            $preference = $this->preferences->create($profile->id, $data);
        }

        PreferenceUpdated::dispatch($profile, $preference);

        return $preference;
    }

    public function show(string $userId): CustomerPreference
    {
        $profile = $this->requireProfile($userId);

        return $this->preferences->findByCustomerId($profile->id);
    }

    private function requireProfile(string $userId): \App\Models\Customer\CustomerProfile
    {
        $profile = $this->customers->findByUserId($userId);

        throw_unless($profile, new \InvalidArgumentException('Profil customer tidak ditemukan.'));

        return $profile;
    }
}
