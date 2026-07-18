<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingStop extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'sequence',
        'address',
        'latitude',
        'longitude',
        'estimated_arrival',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'estimated_arrival' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
