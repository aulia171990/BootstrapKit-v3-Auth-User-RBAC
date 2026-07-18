<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingVehicleType extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'capacity',
        'active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'active' => 'boolean',
    ];
}
