<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'driver_code',
        'license_plate',
        'vehicle_type',
        'status',
        'verification_status',
        'rating',
        'completed_trips',
        'cancelled_trips',
        'acceptance_rate',
        'online_status',
        'last_online_at',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'rating' => 'float',
        'acceptance_rate' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'last_online_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_OFFLINE = 'offline';
    public const STATUS_ONLINE = 'online';
    public const STATUS_BUSY = 'busy';
    public const STATUS_ON_TRIP = 'on_trip';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DriverDocument::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(DriverVehicleAssignment::class);
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(DriverBankAccount::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(DriverLocation::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(DriverStatusHistory::class);
    }
}
