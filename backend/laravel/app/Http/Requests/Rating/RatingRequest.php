<?php

namespace App\Http\Requests\Rating;

use Illuminate\Foundation\Http\FormRequest;

class RatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'trip_id' => ['required', 'string'],
            'rater_user_id' => ['required', 'string'],
            'rated_user_id' => ['required', 'string'],
            'score' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_anonymous' => ['boolean'],
            'category_scores' => ['nullable', 'array'],
        ];
    }
}
