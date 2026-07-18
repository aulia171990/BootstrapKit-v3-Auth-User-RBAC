<?php

namespace App\DTOs\Pricing;

final class FareResult
{
    public function __construct(
        public array $components,
        public string $currency,
        public float $finalFare,
    ) {}

    public static function fromComponents(array $components, string $currency): self
    {
        $finalFare = 0;
        foreach ($components as $component) {
            $amount = $component instanceof FareComponent ? $component->amount : (float) $component;
            $finalFare += $amount;
        }

        $finalFare = (float) round($finalFare, 2);

        return new self($components, $currency, $finalFare);
    }

    public function toArray(): array
    {
        return [
            'components' => collect($this->components)->map(fn ($c) => [
                'code' => $c->code,
                'amount' => (float) $c->amount,
                'label' => $c->label,
            ])->all(),
            'currency' => $this->currency,
            'final_fare' => $this->finalFare,
        ];
    }
}
