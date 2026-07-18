<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
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
            'conversation_id' => ['required', 'string'],
            'body' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:text,image,location,quick_reply,system'],
            'payload' => ['nullable', 'array'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.type' => ['required', 'string'],
            'attachments.*.url' => ['required', 'string'],
            'attachments.*.size' => ['nullable', 'integer', 'min:0', 'max:10485760'],
            'attachments.*.mime_type' => ['nullable', 'string'],
        ];
    }
}
