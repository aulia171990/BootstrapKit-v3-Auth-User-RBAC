<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Powers `POST /auth/password/change` (authenticated).
     * Requires the current password (verified server-side by AuthService) and
     * a fresh, strong, non-reused password.
     */
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'current_password' => [
                'required',
                'string',
                'min:8',
                'max:255',
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                // Must differ from the current password.
                'different:current_password',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.different'        => 'Password baru harus berbeda dari password saat ini.',
            'password.confirmed'        => 'Konfirmasi password tidak cocok.',
        ];
    }
}
