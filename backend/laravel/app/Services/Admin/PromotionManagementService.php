<?php

namespace App\Services\Admin;

use App\Repositories\Promotion\PromotionRepository;

class PromotionManagementService
{
    public function __construct(private PromotionRepository $promotions) {}

    public function list(int $perPage = 20)
    {
        return $this->promotions->paginateLatest($perPage);
    }
}
