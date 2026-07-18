<?php

namespace Tests\Unit\Pricing;

use App\DTOs\Pricing\FareComponent;
use App\DTOs\Pricing\FareResult;
use Tests\TestCase;

class FareComponentTest extends TestCase
{
    public function test_fare_result_sums_components(): void
    {
        $components = [
            new FareComponent('base_fare', 10000, 'Base fare'),
            new FareComponent('distance_fare', 7000, 'Distance fare'),
            new FareComponent('duration_fare', 5000, 'Duration fare'),
        ];

        $result = FareResult::fromComponents($components, 'IDR');

        $this->assertSame('IDR', $result->currency);
        $this->assertSame(22000.0, $result->finalFare);
    }
}
