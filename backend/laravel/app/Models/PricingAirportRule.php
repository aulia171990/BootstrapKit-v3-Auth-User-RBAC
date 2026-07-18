<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingAirportRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'airport_code',
        'city',
        'airport_name',
        'surcharge',
        'pickup_fee',
        'dropoff_fee',
        'currency',
        'active',
    ];

    protected $casts = [
        'surcharge' => 'decimal:2',
        'pickup_fee' => 'decimal:2',
        'dropoff_fee' => 'decimal:2',
        'active' => 'boolean',
    ];
}
