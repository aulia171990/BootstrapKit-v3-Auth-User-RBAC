<?php

namespace App\Exceptions\Api;

use RuntimeException;

class ApiGatewayException extends RuntimeException
{
    public static function invalidApiKey(): self
    {
        return new self('Invalid API key or client credentials.');
    }
}
