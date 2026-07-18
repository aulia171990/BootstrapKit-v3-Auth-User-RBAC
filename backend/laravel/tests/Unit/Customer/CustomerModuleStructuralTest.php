<?php

namespace Tests\Unit\Customer;

use App\Events\AddressAdded;
use App\Events\CustomerProfileUpdated;
use App\Events\FavoritePlaceCreated;
use App\Events\PreferenceUpdated;
use App\Events\ReferralCreated;
use App\Http\Controllers\Customer\CustomerController;
use App\Models\Customer\CustomerProfile;
use App\Repositories\Customer\AddressRepository;
use App\Repositories\Customer\CustomerRepository;
use App\Repositories\Customer\FavoritePlaceRepository;
use App\Repositories\Customer\PreferenceRepository;
use App\Repositories\Customer\ReferralRepository;
use App\Services\Customer\AddressService;
use App\Services\Customer\CustomerProfileService;
use App\Services\Customer\FavoritePlaceService;
use App\Services\Customer\PreferenceService;
use App\Services\Customer\ReferralService;
use Tests\TestCase;

class CustomerModuleStructuralTest extends TestCase
{
    public function test_customer_profile_relations_exist(): void
    {
        $rels = ['addresses', 'favoritePlaces', 'emergencyContacts', 'preference', 'referrals', 'user'];

        foreach ($rels as $relation) {
            $this->assertTrue(
                method_exists(CustomerProfile::class, $relation),
                "Missing relation: CustomerProfile::$relation"
            );
        }
    }

    public function test_customer_controllers_methods_exist(): void
    {
        foreach (['profile', 'updateProfile', 'addresses', 'createAddress', 'updateAddress', 'deleteAddress', 'favorites', 'createFavorite', 'preferences', 'updatePreferences', 'createReferral', 'redeemReferral'] as $method) {
            $this->assertTrue(method_exists(CustomerController::class, $method), "Missing controller method: $method");
        }
    }

    public function test_repositories_have_expected_methods(): void
    {
        $this->assertContains('create', get_class_methods(AddressRepository::class));
        $this->assertContains('update', get_class_methods(AddressRepository::class));
        $this->assertContains('delete', get_class_methods(AddressRepository::class));
        $this->assertContains('create', get_class_methods(FavoritePlaceRepository::class));
        $this->assertContains('update', get_class_methods(PreferenceRepository::class));
        $this->assertContains('markRedeemed', get_class_methods(ReferralRepository::class));
    }

    public function test_services_are_injectable(): void
    {
        foreach ([CustomerProfileService::class, AddressService::class, FavoritePlaceService::class, PreferenceService::class, ReferralService::class] as $class) {
            $this->assertTrue(method_exists($class, '__construct'));
        }
    }

    public function test_events_exist(): void
    {
        foreach ([CustomerProfileUpdated::class, AddressAdded::class, FavoritePlaceCreated::class, PreferenceUpdated::class, ReferralCreated::class] as $class) {
            $this->assertTrue(method_exists($class, '__construct'));
        }
    }
}
