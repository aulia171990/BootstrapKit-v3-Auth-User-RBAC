<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class PreferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'preferred_vehicle' => 'nullable|string|max:50',
            'accessibility' => 'nullable|boolean',
            'quiet_ride' => 'nullable|boolean',
            'air_conditioning' => 'nullable|boolean',
            'music_preference' => 'nullable|string|max:100',
            'pet_friendly' => 'nullable|boolean',
        ];
    }
}
