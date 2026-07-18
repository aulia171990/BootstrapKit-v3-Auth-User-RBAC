<?php

namespace Tests\Unit\Payment;

use App\DTOs\Payment\PaymentResult;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentResultTest extends TestCase
{
    #[Test]
    public function success_factory_builds_success_result(): void
    {
        $result = PaymentResult::success('ref-1', 'gateway-1', ['ok' => true]);

        $this->assertTrue($result->success);
        $this->assertSame('success', $result->status);
        $this->assertSame('ref-1', $result->reference);
    }

    #[Test]
    public function failure_factory_builds_failure_result(): void
    {
        $result = PaymentResult::failure('failed', ['error' => 'x']);

        $this->assertFalse($result->success);
        $this->assertSame('failed', $result->status);
        $this->assertNull($result->reference);
    }
}
