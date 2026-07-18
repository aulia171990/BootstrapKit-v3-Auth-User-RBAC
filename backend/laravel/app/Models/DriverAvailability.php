<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DriverAvailability extends Model
{
    use HasUuids;

    protected $fillable = [
        'driver_id',
        'status',
        'last_latitude',
        'last_longitude',
        'active_trips',
        'last_seen_at',
    ];

    protected $casts = [
        'last_latitude' => 'float',
        'last_longitude' => 'float',
        'active_trips' => 'integer',
        'last_seen_at' => 'datetime',
    ];

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_BUSY = 'busy';
    public const STATUS_OFFLINE = 'offline';

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(DriverAssignment::class, 'driver_id', 'driver_id');
    }
}
