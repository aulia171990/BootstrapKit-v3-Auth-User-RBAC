<?php

namespace App\Http\Requests\Map;

use Illuminate\Foundation\Http\FormRequest;

class ETACalculationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat' => 'required|numeric',
            'to_lng' => 'required|numeric',
            'mode' => 'nullable|string|min:2',
        ];
    }
}
