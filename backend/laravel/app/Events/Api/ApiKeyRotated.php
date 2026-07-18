<?php

namespace App\Events\Api;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Api\ApiKey;

class ApiKeyRotated
{
    use Dispatchable, SerializesModels;

    public function __construct(public ApiKey $key) {}
}
