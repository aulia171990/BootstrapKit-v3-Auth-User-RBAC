<?php

namespace App\Repositories\Customer;

use App\Models\Customer\CustomerReferral;

class ReferralRepository
{
    public function create(string $customerProfileId, string $code): CustomerReferral
    {
        return CustomerReferral::create(['customer_profile_id' => $customerProfileId, 'code' => $code]);
    }

    public function findByCode(string $code): ?CustomerReferral
    {
        return CustomerReferral::where('code', $code)->first();
    }

    public function markRedeemed(string $referralId, ?string $referredCustomerProfileId = null): CustomerReferral
    {
        $referral = CustomerReferral::findOrFail($referralId);
        $referral->forceFill([
            'referred_customer_profile_id' => $referredCustomerProfileId,
            'redeemed_at' => now(),
        ])->save();

        return $referral->fresh();
    }
}
