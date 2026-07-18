<?php

namespace App\Repositories\Api;

use App\Models\Api\ApiScope;

class ApiScopeRepository
{
    public function create(array $data): ApiScope
    {
        return ApiScope::create($data);
    }

    public function find(string $id): ?ApiScope
    {
        return ApiScope::find($id);
    }

    public function findByCode(string $code): ?ApiScope
    {
        return ApiScope::where('code', $code)->first();
    }

    public function all(): array
    {
        return ApiScope::all()->toArray();
    }
}
