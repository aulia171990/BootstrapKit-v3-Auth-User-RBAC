<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingFare extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'base_fare',
        'distance_fare',
        'duration_fare',
        'surge',
        'discount',
        'tax',
        'total',
        'currency',
    ];

    protected $casts = [
        'base_fare' => 'float',
        'distance_fare' => 'float',
        'duration_fare' => 'float',
        'surge' => 'float',
        'discount' => 'float',
        'tax' => 'float',
        'total' => 'float',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
