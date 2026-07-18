<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasUuids;

    protected $fillable = [
        'trip_code',
        'booking_id',
        'driver_id',
        'customer_id',
        'vehicle_id',
        'dispatch_job_id',
        'status',
        'started_at',
        'arrived_at',
        'picked_up_at',
        'completed_at',
        'cancelled_at',
        'estimated_distance',
        'actual_distance',
        'estimated_duration',
        'actual_duration',
        'estimated_fare',
        'final_fare',
        'waiting_time',
        'route_polyline',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'arrived_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'estimated_distance' => 'float',
        'actual_distance' => 'float',
        'estimated_duration' => 'integer',
        'actual_duration' => 'integer',
        'estimated_fare' => 'float',
        'final_fare' => 'float',
        'waiting_time' => 'integer',
    ];

    public const STATUS_CREATED = 'created';
    public const STATUS_DRIVER_EN_ROUTE = 'driver_en_route';
    public const STATUS_DRIVER_ARRIVED = 'driver_arrived';
    public const STATUS_PASSENGER_BOARDING = 'passenger_boarding';
    public const STATUS_STARTED = 'started';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_WAITING = 'waiting';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EMERGENCY = 'emergency';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(TripStatusHistory::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(TripLocation::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(TripEvent::class);
    }
}
