<?php

namespace App\Events;

use App\Models\Customer\CustomerProfile;
use App\Models\Customer\CustomerPreference;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PreferenceUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public CustomerProfile $profile,
        public CustomerPreference $preference,
    ) {}
}
