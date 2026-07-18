<?php

namespace App\Http\Requests\Map;

use Illuminate\Foundation\Http\FormRequest;

class RouteCalculationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'waypoints' => 'required|array|min:2',
            'waypoints.*.lat' => 'required|numeric',
            'waypoints.*.lng' => 'required|numeric',
            'options' => 'nullable|array',
        ];
    }
}
