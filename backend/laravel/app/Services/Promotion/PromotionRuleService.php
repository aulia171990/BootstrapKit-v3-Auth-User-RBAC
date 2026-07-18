<?php

namespace App\Services\Promotion;

use App\Exceptions\Promotion\PromotionException;
use App\Models\Promotion\Promotion;
use App\Models\Promotion\PromotionRule;
use App\Repositories\Promotion\PromotionRuleRepository;

final class PromotionRuleService
{
    public function __construct(private PromotionRuleRepository $rules) {}

    public function addRules(string $promotionId, array $rules, int $basePriority = 0): void
    {
        foreach ($rules as $index => $rule) {
            $this->rules->create($promotionId, [
                'type' => $rule['type'],
                'operator' => $rule['operator'],
                'value' => $rule['value'] ?? null,
                'comparison_value' => $rule['comparison_value'] ?? null,
                'priority' => $basePriority + $index,
                'active' => true,
            ]);
        }
    }

    /**
     * @return array<int, array<string,mixed>>
     */
    public function export(Promotion $promotion): array
    {
        $exported = [];
        foreach ($promotion->rules()->get()->all() as $rule) {
            $exported[] = [
                'type' => $rule->type,
                'operator' => $rule->operator,
                'value' => $rule->value,
                'comparison_value' => $rule->comparison_value,
                'priority' => (int) $rule->priority,
                'active' => (bool) $rule->active,
            ];
        }

        return $exported;
    }
}
