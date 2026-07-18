<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class ConversationRequest extends FormRequest
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
            'type' => ['required', 'string', 'in:trip,support,merchant,group'],
            'trip_id' => ['nullable', 'string'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*' => ['required', 'string'],
        ];
    }
}
