<?php

namespace App\Events;

use App\Models\Customer\CustomerProfile;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReferralCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public CustomerProfile $profile, public string $code) {}
}
