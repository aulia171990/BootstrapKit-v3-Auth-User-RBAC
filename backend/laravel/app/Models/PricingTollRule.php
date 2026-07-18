<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingTollRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'city',
        'road_or_gate',
        'type',
        'amount',
        'currency',
        'active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'active' => 'boolean',
    ];
}
