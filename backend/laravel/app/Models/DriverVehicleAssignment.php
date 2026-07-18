<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverVehicleAssignment extends Model
{
    use HasUuids;

    protected $fillable = [
        'driver_id',
        'plate_number',
        'brand',
        'model',
        'year',
        'color',
        'vehicle_type',
        'capacity',
        'verification_status',
        'is_primary',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_primary' => 'boolean',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
