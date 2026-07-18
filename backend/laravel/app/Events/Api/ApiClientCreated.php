<?php

namespace App\Events\Api;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Api\ApiClient;

class ApiClientCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public ApiClient $client) {}
}
