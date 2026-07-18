<?php

namespace App\Http\Requests\Map;

use Illuminate\Foundation\Http\FormRequest;

class SearchAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query' => 'required|string|min:2',
            'context' => 'nullable|array',
        ];
    }
}
