<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingZone extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'city',
        'bounds',
        'polygon',
        'active',
    ];

    protected $casts = [
        'bounds' => 'array',
        'polygon' => 'array',
        'active' => 'boolean',
    ];
}
