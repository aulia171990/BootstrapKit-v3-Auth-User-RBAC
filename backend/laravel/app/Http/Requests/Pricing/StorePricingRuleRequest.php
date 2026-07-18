<?php

namespace App\Http\Requests\Pricing;

use Illuminate\Foundation\Http\FormRequest;

class StorePricingRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type' => 'nullable|string|max:100',
            'vehicle_type' => 'nullable|string|max:100',
            'city' => 'required|string|max:100',
            'base_fare' => 'required|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'per_km_rate' => 'required|numeric|min:0',
            'per_minute_rate' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'active' => 'nullable|boolean',
            'effective_from' => 'nullable|date',
            'effective_until' => 'nullable|date|after:effective_from',
        ];
    }
}
