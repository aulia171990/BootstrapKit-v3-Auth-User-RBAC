<?php

namespace App\Events\Api;

use App\Models\Api\ApiKey;

class ApiKeyRotated
{
    public function __construct(public ApiKey $key) {}
}