<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    /**
     * Powers `POST /auth/password/email` (requestPasswordReset).
     * Accepts an email OR phone as the account identifier; the service layer
     * resolves which one it is. Anti-enumeration: the controller returns the
     * same 200 either way, so we only validate shape here.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => [
                'required',
                'string',
                'max:255',
                'regex:/^(\S+@\S+\.\S+|[0-9+\-\s]{6,20})$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'Email atau nomor telepon wajib diisi.',
            'identifier.regex'    => 'Format email atau nomor telepon tidak valid.',
        ];
    }
}
