<?php

namespace App\Services\Promotion;

use App\Exceptions\Promotion\PromotionException;
use App\Models\Promotion\Promotion;
use App\Models\Promotion\PromotionUsage;
use Carbon\Carbon;
use Illuminate\Cache\CacheManager;

final class PromotionValidationService
{
    public function __construct(
        private CacheManager $cache,
        private PromotionService $promotions,
        private PromotionRuleService $ruleService,
    ) {}

    public function validateOrFail(Promotion $promotion, array $context = []): Promotion
    {
        if (($promotion->status ?? null) !== 'active') {
            throw new PromotionException('Promotion is not active.');
        }

        if ($promotion->starts_at && Carbon::parse($promotion->starts_at)->isFuture()) {
            throw new PromotionException('Promotion is not yet active.');
        }

        if ($promotion->expires_at && Carbon::parse($promotion->expires_at)->isPast()) {
            throw new PromotionException('Promotion has expired.');
        }

        foreach ($promotion->rules()->where('active', true)->orderBy('priority')->get()->all() as $rule) {
            $this->assertRule($rule, $context);
        }

        return $promotion;
    }

    private function assertRule(PromotionRule $rule, array $context): void
    {
        $actual = $context[$rule->type] ?? null;
        $expected = $rule->comparison_value ?? $rule->value;

        if (! $this->matches($rule->operator, $actual, $expected)) {
            throw new PromotionException('Promotion rule failed: '.$rule->type);
        }
    }

    private function matches(string $operator, mixed $actual, mixed $expected): bool
    {
        return match ($operator) {
            'eq' => $actual == $expected,
            'neq' => $actual != $expected,
            'gt' => (float) ($actual ?? 0) > (float) ($expected ?? 0),
            'gte' => (float) ($actual ?? 0) >= (float) ($expected ?? 0),
            'lt' => (float) ($actual ?? 0) < (float) ($expected ?? 0),
            'lte' => (float) ($actual ?? 0) <= (float) ($expected ?? 0),
            'in' => is_array($expected) && in_array($actual, $expected, true),
            'not_in' => is_array($expected) && ! in_array($actual, $expected, true),
            'between' => is_array($expected) && count($expected) === 2 && (float) ($actual ?? 0) >= (float) $expected[0] && (float) ($actual ?? 0) <= (float) $expected[1],
            'contains' => is_array($actual) && is_array($expected) && count(array_intersect($actual, $expected)) > 0,
            default => true,
        };
    }
}
