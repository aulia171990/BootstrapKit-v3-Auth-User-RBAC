<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingWaitingRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'city',
        'service_type',
        'vehicle_type',
        'free_minutes',
        'per_minute_rate',
        'max_fee',
        'active',
    ];

    protected $casts = [
        'free_minutes' => 'integer',
        'per_minute_rate' => 'decimal:2',
        'max_fee' => 'decimal:2',
        'active' => 'boolean',
    ];
}
