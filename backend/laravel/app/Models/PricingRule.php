<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'service_type',
        'vehicle_type',
        'city',
        'base_fare',
        'minimum_fare',
        'per_km_rate',
        'per_minute_rate',
        'currency',
        'active',
        'effective_from',
        'effective_until',
    ];

    protected $casts = [
        'base_fare' => 'decimal:2',
        'minimum_fare' => 'decimal:2',
        'per_km_rate' => 'decimal:4',
        'per_minute_rate' => 'decimal:4',
        'active' => 'boolean',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
    ];
}
