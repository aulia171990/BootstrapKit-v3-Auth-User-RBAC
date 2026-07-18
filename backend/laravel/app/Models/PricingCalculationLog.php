<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingCalculationLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'pricing_rule_id',
        'booking_id',
        'trip_id',
        'request_id',
        'input',
        'components',
        'final_fare',
        'currency',
        'calculation_time_ms',
        'calculated_at',
    ];

    protected $casts = [
        'input' => 'array',
        'components' => 'array',
        'final_fare' => 'decimal:2',
        'calculation_time_ms' => 'integer',
        'calculated_at' => 'datetime',
    ];
}
