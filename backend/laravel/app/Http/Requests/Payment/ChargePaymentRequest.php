<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class ChargePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => 'required|string',
            'payment_method' => 'required|string',
            'amount' => 'required|integer|min:1000',
            'currency' => 'string|size:3',
            'reference' => 'nullable|string',
        ];
    }
}
