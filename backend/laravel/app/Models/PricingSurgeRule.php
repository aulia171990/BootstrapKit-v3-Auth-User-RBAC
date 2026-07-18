<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingSurgeRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'type',
        'city',
        'service_type',
        'vehicle_type',
        'conditions',
        'multiplier',
        'max_multiplier',
        'starts_at',
        'ends_at',
        'active',
    ];

    protected $casts = [
        'conditions' => 'array',
        'multiplier' => 'decimal:2',
        'max_multiplier' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'active' => 'boolean',
    ];
}
