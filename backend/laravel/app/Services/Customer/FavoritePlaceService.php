<?php

namespace App\Services\Customer;

use App\Events\FavoritePlaceCreated;
use App\Exceptions\Auth\AuthException;
use App\Models\Customer\CustomerFavoritePlace;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Customer\FavoritePlaceRepository;

class FavoritePlaceService
{
    public function __construct(
        private CustomerRepository $customers,
        private FavoritePlaceRepository $favorites,
    ) {}

    public function create(string $userId, array $data): CustomerFavoritePlace
    {
        $profile = $this->requireProfile($userId);

        $favorite = $this->favorites->create($profile->id, $data);

        FavoritePlaceCreated::dispatch($favorite);

        return $favorite->fresh();
    }

    public function list(string $userId): array
    {
        $profile = $this->requireProfile($userId);

        return $this->favorites->listForCustomer($profile->id);
    }

    private function requireProfile(string $userId): \App\Models\Customer\CustomerProfile
    {
        $profile = $this->customers->findByUserId($userId);

        throw_unless($profile, new \InvalidArgumentException('Profil customer tidak ditemukan.'));

        return $profile;
    }
}
