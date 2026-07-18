<?php

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;

class CompleteTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actual_distance' => 'nullable|numeric',
            'actual_duration' => 'nullable|integer|min:0',
            'final_fare' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }
}