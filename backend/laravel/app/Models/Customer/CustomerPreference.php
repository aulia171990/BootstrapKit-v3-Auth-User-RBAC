<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerPreference extends Model
{
    protected $fillable = [
        'customer_profile_id',
        'preferred_vehicle',
        'accessibility',
        'quiet_ride',
        'air_conditioning',
        'music_preference',
        'pet_friendly',
    ];

    protected $casts = [
        'accessibility' => 'boolean',
        'quiet_ride' => 'boolean',
        'air_conditioning' => 'boolean',
        'pet_friendly' => 'boolean',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_profile_id');
    }
}
