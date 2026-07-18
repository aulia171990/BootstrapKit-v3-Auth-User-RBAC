<?php

namespace App\Services\Promotion;

use App\Exceptions\Promotion\PromotionException;
use App\Repositories\Promotion\PromotionCodeRepository;
use App\Repositories\Promotion\PromotionRepository;

final class VoucherService
{
    public function __construct(
        private PromotionRepository $promotions,
        private PromotionCodeRepository $codes,
    ) {}

    public function validate(string $code): ?array
    {
        $promoCode = $this->codes->findValid($code);

        if (! $promoCode) {
            throw new PromotionException('Invalid or exhausted voucher code.');
        }

        $promotion = $this->promotions->findActiveByCode($promoCode->promotion_id);

        if (! $promotion) {
            throw new PromotionException('Voucher promotion is not active.');
        }

        return ['promotion' => $promotion, 'code' => $promoCode];
    }
}
