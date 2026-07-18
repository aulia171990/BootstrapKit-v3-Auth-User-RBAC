<?php

namespace App\Services\Customer;

use App\Events\ReferralCreated;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerProfile;
use App\Models\User;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Customer\ReferralRepository;
use Illuminate\Support\Str;

class ReferralService
{
    public function __construct(
        private CustomerRepository $customers,
        private ReferralRepository $referrals,
    ) {}

    public function createForUser(string $userId): CustomerProfile
    {
        $profile = $this->requireProfile($userId);

        if (! $profile->referral_code) {
            $code = $this->uniqueCode();
            $profile->referral_code = $code;
            $profile->save();
            $this->referrals->create($profile->id, $code);
            ReferralCreated::dispatch($profile, $code);
        }

        return $profile->fresh();
    }

    public function redeem(string $userId, string $code): CustomerProfile
    {
        $profile = $this->requireProfile($userId);

        $referral = $this->referrals->findByCode($code);

        throw_unless($referral, throw new \InvalidArgumentException('Kode referral tidak valid.'));

        $this->referrals->markRedeemed((string) $referral->id, $profile->id);

        return $this->customers->findByUserId($userId)?->fresh();
    }

    private function uniqueCode(): string
    {
        $code = strtoupper(Str::random(8));

        while (\App\Models\Customer\CustomerProfile::where('referral_code', $code)->exists()) {
            $code = strtoupper(Str::random(8));
        }

        return $code;
    }

    private function requireProfile(string $userId): CustomerProfile
    {
        $profile = $this->customers->findByUserId($userId);

        throw_unless($profile, throw new \InvalidArgumentException('Profil customer tidak ditemukan.'));

        return $profile;
    }
}
