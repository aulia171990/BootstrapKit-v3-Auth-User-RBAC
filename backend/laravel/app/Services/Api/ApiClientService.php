<?php

namespace App\Services\Api;

use App\Models\Api\ApiClient;
use App\Repositories\Api\ApiClientRepository;
use App\Events\Api\ApiClientCreated;
use Illuminate\Support\Str;

class ApiClientService
{
    public function __construct(private ApiClientRepository $clients) {}

    public function create(array $data, string $ownerId): ApiClient
    {
        $client = $this->clients->create([
            'user_id' => (string) $ownerId,
            'name' => $data['name'],
            'type' => $data['type'] ?? 'partner',
            'scopes' => $data['scopes'] ?? null,
            'is_active' => true,
        ]);

        event(new ApiClientCreated($client));

        return $client;
    }

    public function find(string $id): ?ApiClient
    {
        return $this->clients->find($id);
    }
}
