<?php

namespace App\Services\Strategies;

interface DispatchStrategyInterface
{
    /**
     * @param array<int, array<string, mixed>> $candidates
     * @return array<int, array<string, mixed>>
     */
    public function rank(string $bookingId, array $candidates): array;
}
