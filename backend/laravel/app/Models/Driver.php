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
        'license_plate',
        'vehicle_type',
        'status',
        'rating',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'rating' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public const STATUS_OFFLINE = 'offline';
    public const STATUS_ONLINE = 'online';
    public const STATUS_ON_TRIP = 'on_trip';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
