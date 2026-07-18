<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type' => ['required', 'string', 'max:50'],
            'pickup_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['required', 'numeric', 'between:-180,180'],
            'pickup_address' => ['required', 'string', 'max:500'],
            'destination_latitude' => ['required', 'numeric', 'between:-90,90'],
            'destination_longitude' => ['required', 'numeric', 'between:-180,180'],
            'destination_address' => ['required', 'string', 'max:500'],
            'estimated_distance' => ['nullable', 'numeric', 'min:0'],
            'estimated_duration' => ['nullable', 'integer', 'min:0'],
            'estimated_fare' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'scheduled_at' => ['nullable', 'date'],
            'passengers' => ['nullable', 'array', 'max:8'],
            'passengers.*.name' => ['required_with:passengers', 'string', 'max:255'],
            'passengers.*.phone' => ['required_with:passengers', 'string', 'max:50'],
            'passengers.*.emergency_contact' => ['nullable', 'string', 'max:255'],
            'passengers.*.special_notes' => ['nullable', 'string', 'max:500'],
            'stops' => ['nullable', 'array', 'max:10'],
            'stops.*.sequence' => ['required_with:stops', 'integer', 'min:1'],
            'stops.*.address' => ['required_with:stops', 'string', 'max:500'],
            'stops.*.latitude' => ['required_with:stops', 'numeric', 'between:-90,90'],
            'stops.*.longitude' => ['required_with:stops', 'numeric', 'between:-180,180'],
            'stops.*.estimated_arrival' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
