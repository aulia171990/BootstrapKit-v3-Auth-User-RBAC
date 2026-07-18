<?php

namespace App\Exceptions\Promotion;

use RuntimeException;

class PromotionException extends RuntimeException
{
    public static function notFound(): self
    {
        return new self('Promotion not found.');
    }
}
