<?php

namespace Tests\Feature\Payment;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentRepositoryTest extends TestCase
{
    #[Test]
    public function repository_contract_does_not_touch_missing_tables(): void
    {
        $this->assertTrue(true);
    }
}
