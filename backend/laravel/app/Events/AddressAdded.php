<?php

namespace App\Events;

use App\Models\Customer\CustomerAddress;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AddressAdded
{
    use Dispatchable, SerializesModels;

    public function __construct(public CustomerAddress $address) {}
}
