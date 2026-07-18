<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_code',
        'customer_id',
        'driver_id',
        'vehicle_type',
        'service_type',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_address',
        'destination_latitude',
        'destination_longitude',
        'destination_address',
        'estimated_distance',
        'estimated_duration',
        'estimated_fare',
        'final_fare',
        'payment_method',
        'status',
        'scheduled_at',
        'requested_at',
        'accepted_at',
        'arrived_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancelled_by',
        'notes',
    ];

    protected $casts = [
        'pickup_latitude' => 'float',
        'pickup_longitude' => 'float',
        'destination_latitude' => 'float',
        'destination_longitude' => 'float',
        'estimated_distance' => 'float',
        'estimated_duration' => 'integer',
        'estimated_fare' => 'float',
        'final_fare' => 'float',
        'scheduled_at' => 'datetime',
        'requested_at' => 'datetime',
        'accepted_at' => 'datetime',
        'arrived_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SEARCHING_DRIVER = 'searching_driver';
    public const STATUS_DRIVER_ASSIGNED = 'driver_assigned';
    public const STATUS_DRIVER_ACCEPTED = 'driver_accepted';
    public const STATUS_DRIVER_ARRIVED = 'driver_arrived';
    public const STATUS_PASSENGER_ONBOARD = 'passenger_onboard';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_REJECTED = 'rejected';

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function stops(): HasMany
    {
        return $this->hasMany(BookingStop::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(BookingPassenger::class);
    }

    public function fares(): HasMany
    {
        return $this->hasMany(BookingFare::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class);
    }

    public function cancellation(): HasOne
    {
        return $this->hasOne(BookingCancellation::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(BookingNote::class);
    }
}
