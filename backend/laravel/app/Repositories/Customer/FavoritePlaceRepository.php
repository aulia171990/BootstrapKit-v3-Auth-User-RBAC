<?php

namespace App\Repositories\Customer;

use App\Models\Customer\CustomerFavoritePlace;

class FavoritePlaceRepository
{
    public function create(string $customerProfileId, array $data): CustomerFavoritePlace
    {
        return CustomerFavoritePlace::create(array_merge($data, ['customer_profile_id' => $customerProfileId]));
    }

    public function findForCustomer(string $customerProfileId, string $favoriteId): ?CustomerFavoritePlace
    {
        return CustomerFavoritePlace::where('customer_profile_id', $customerProfileId)->where('id', $favoriteId)->first();
    }

    public function listForCustomer(string $customerProfileId): array
    {
        return CustomerFavoritePlace::where('customer_profile_id', $customerProfileId)->get()->all();
    }
}
