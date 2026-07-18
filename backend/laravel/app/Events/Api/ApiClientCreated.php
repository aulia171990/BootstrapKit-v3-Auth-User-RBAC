<?php

namespace App\Events\Api;

use App\Models\Api\ApiClient;

class ApiClientCreated
{
    public function __construct(public ApiClient $client) {}
}