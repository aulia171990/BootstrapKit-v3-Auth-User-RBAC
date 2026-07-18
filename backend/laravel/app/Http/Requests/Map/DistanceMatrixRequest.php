<?php

namespace App\Http\Requests\Map;

use Illuminate\Foundation\Http\FormRequest;

class DistanceMatrixRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'origins' => 'required|array|min:1',
            'origins.*.lat' => 'required|numeric',
            'origins.*.lng' => 'required|numeric',
            'destinations' => 'required|array|min:1',
            'destinations.*.lat' => 'required|numeric',
            'destinations.*.lng' => 'required|numeric',
            'options' => 'nullable|array',
        ];
    }
}
