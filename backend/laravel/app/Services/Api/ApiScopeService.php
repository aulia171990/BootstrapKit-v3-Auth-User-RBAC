<?php

namespace App\Services\Api;

use App\Models\Api\ApiScope;
use App\Repositories\Api\ApiScopeRepository;

class ApiScopeService
{
    public function __construct(private ApiScopeRepository $scopes) {}

    public function create(array $data): ApiScope
    {
        return $this->scopes->create($data);
    }

    public function all(): array
    {
        return $this->scopes->all();
    }
}
