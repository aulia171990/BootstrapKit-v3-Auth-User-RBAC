<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class NotificationPreferenceRequest extends FormRequest
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
            'preferences' => ['required', 'array'],
            'preferences.*.channel' => ['required', 'string', 'max:50'],
            'preferences.*.enabled' => ['required', 'boolean'],
            'preferences.*.settings' => ['nullable', 'array'],
        ];
    }
}
