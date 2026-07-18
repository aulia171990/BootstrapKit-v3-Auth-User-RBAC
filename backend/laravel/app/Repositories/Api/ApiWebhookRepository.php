<?php

namespace App\Repositories\Api;

use App\Models\Api\ApiWebhook;

class ApiWebhookRepository
{
    public function create(array $data): ApiWebhook
    {
        return ApiWebhook::create($data);
    }

    public function find(string $id): ?ApiWebhook
    {
        return ApiWebhook::find($id);
    }

    public function findActiveForClient(string $clientId)
    {
        return ApiWebhook::where('api_client_id', $clientId)
            ->where('is_active', true)
            ->get();
    }
}
