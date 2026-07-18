<?php

namespace App\Http\Requests\Pricing;

use Illuminate\Foundation\Http\FormRequest;

class EstimatePricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => 'required|string|max:100',
            'service_type' => 'nullable|string|max:100',
            'vehicle_type' => 'nullable|string|max:100',
            'distance_km' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:0',
            'toll' => 'nullable|numeric|min:0',
            'platform_fee' => 'nullable|numeric|min:0',
            'insurance_fee' => 'nullable|numeric|min:0',
            'promo_discount' => 'nullable|numeric|min:0',
            'voucher_discount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'surge_multiplier' => 'nullable|numeric|min:0',
            'booking_id' => 'nullable|uuid',
            'trip_id' => 'nullable|string',
            'request_id' => 'nullable|uuid',
            'airport_code' => 'nullable|string|max:10',
            'pickup_type' => 'nullable|string|in:pickup,dropoff',
            'waiting_minutes' => 'nullable|integer|min:0',
        ];
    }
}
