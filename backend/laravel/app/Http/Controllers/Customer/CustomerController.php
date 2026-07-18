<?php

namespace App\Http\Controllers\Customer;

use App\Events\AddressAdded;
use App\Events\CustomerProfileUpdated;
use App\Events\FavoritePlaceCreated;
use App\Events\PreferenceUpdated;
use App\Events\ReferralCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddressRequest;
use App\Http\Requests\Customer\CustomerProfileRequest;
use App\Http\Requests\Customer\FavoritePlaceRequest;
use App\Http\Requests\Customer\PreferenceRequest;
use App\Http\Requests\Customer\ReferralRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Customer\CustomerProfile;
use App\Services\Customer\AddressService;
use App\Services\Customer\CustomerProfileService;
use App\Services\Customer\FavoritePlaceService;
use App\Services\Customer\PreferenceService;
use App\Services\Customer\ReferralService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerProfileService $profileService,
        private AddressService $addressService,
        private FavoritePlaceService $favoriteService,
        private PreferenceService $preferenceService,
        private ReferralService $referralService,
    ) {
        $this->middleware('auth.api');
        $this->middleware(\App\Http\Middleware\CustomerMiddleware::class);
    }

    public function profile(Request $request)
    {
        return ApiResponse::success($this->profileService->show((string) $request->user()->id));
    }

    public function updateProfile(CustomerProfileRequest $request)
    {
        $profile = $this->profileService->update((string) $request->user()->id, $request->validated());

        CustomerProfileUpdated::dispatch($profile);

        return ApiResponse::success($profile, 'Profil diperbarui');
    }

    public function addresses(Request $request)
    {
        return ApiResponse::success($this->addressService->list((string) $request->user()->id));
    }

    public function createAddress(AddressRequest $request)
    {
        $address = $this->addressService->create((string) $request->user()->id, $request->validated());

        AddressAdded::dispatch($address);

        return ApiResponse::success($address, 'Alamat ditambahkan', 201);
    }

    public function updateAddress(AddressRequest $request, string $id)
    {
        $address = $this->addressService->update((string) $request->user()->id, $id, $request->validated());

        return ApiResponse::success($address, 'Alamat diperbarui');
    }

    public function deleteAddress(Request $request, string $id)
    {
        $deleted = $this->addressService->delete((string) $request->user()->id, $id);

        return ApiResponse::success(['deleted' => (bool) $deleted], 'Alamat dihapus');
    }

    public function favorites(Request $request)
    {
        return ApiResponse::success($this->favoriteService->list((string) $request->user()->id));
    }

    public function createFavorite(FavoritePlaceRequest $request)
    {
        $favorite = $this->favoriteService->create((string) $request->user()->id, $request->validated());

        FavoritePlaceCreated::dispatch($favorite);

        return ApiResponse::success($favorite, 'Tempat favorit disimpan', 201);
    }

    public function preferences(Request $request)
    {
        return ApiResponse::success($this->preferenceService->show((string) $request->user()->id) ?? (object) []);
    }

    public function updatePreferences(PreferenceRequest $request)
    {
        $preference = $this->preferenceService->update((string) $request->user()->id, $request->validated());

        PreferenceUpdated::dispatch($this->profileService->show((string) $request->user()->id), $preference);

        return ApiResponse::success($preference, 'Preferensi diperbarui');
    }

    public function createReferral(ReferralRequest $request)
    {
        $profile = $this->referralService->createForUser((string) $request->user()->id);

        ReferralCreated::dispatch($profile, (string) $profile->referral_code);

        return ApiResponse::success(['referral_code' => $profile->referral_code], 'Referral dibuat', 201);
    }

    public function redeemReferral(ReferralRequest $request)
    {
        $profile = $this->referralService->redeem((string) $request->user()->id, $request->validated('code'));

        return ApiResponse::success(['customer_profile_id' => $profile?->id], 'Referral diterima');
    }
}
