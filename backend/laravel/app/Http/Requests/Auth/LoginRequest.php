<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Login is public (guarded by the `auth.api` middleware exception in
     * AuthController). No further authorization gate needed.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Strong rules for credential submission. Accepts an email OR phone as the
     * identifier; the auth guard resolves which one it is.
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'max:255',
                // Accept a well-formed email OR an E.164-ish phone.
                'regex:/^(\S+@\S+\.\S+|[0-9+\-\s]{6,20})$/',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email atau nomor telepon wajib diisi.',
            'email.regex'    => 'Format email atau nomor telepon tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 8 karakter.',
        ];
    }
}
