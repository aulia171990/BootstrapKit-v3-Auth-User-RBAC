<?php

namespace App\Services\Promotion;

use App\Repositories\Promotion\PromotionCampaignRepository;

final class CampaignService
{
    public function __construct(private PromotionCampaignRepository $campaigns) {}

    public function create(array $data)
    {
        return $this->campaigns->create($data);
    }

    public function active(string $code)
    {
        return $this->campaigns->findActive($code);
    }
}
