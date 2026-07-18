<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Strong, hardened registration rules.
     *
     * Security notes:
     * - `role`/`roles`/`is_admin` are explicitly NOT accepted (privilege
     *   escalation hardening) — the service always assigns the default role.
     * - Password enforces mixed case + number + symbol.
     * - Email and phone must be unique.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                // Disallow angle-bracket / quote chars to reduce injection surface.
                'regex:/^[^<>{};"\']*$/u',
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'phone' => [
                'required',
                'string',
                'regex:/^[0-9+\-\s]{6,20}$/',
                'unique:users,phone',
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
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
            'name.regex'          => 'Nama mengandung karakter tidak diizinkan.',
            'email.email'         => 'Format email tidak valid.',
            'email.unique'        => 'Email sudah terdaftar.',
            'phone.regex'         => 'Format nomor telepon tidak valid.',
            'phone.unique'        => 'Nomor telepon sudah terdaftar.',
            'password.confirmed'  => 'Konfirmasi password tidak cocok.',
        ];
    }

    /**
     * Allowlist only safe keys (defence in depth vs privilege escalation even
     * if a developer later reads the raw request elsewhere).
     */
    public function validated($key = null, $default = null): array
    {
        return collect(parent::validated())
            ->only(['name', 'email', 'phone', 'password'])
            ->all();
    }
}
