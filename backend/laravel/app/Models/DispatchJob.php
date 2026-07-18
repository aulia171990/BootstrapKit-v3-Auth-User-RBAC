<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DispatchJob extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'status',
        'strategy',
        'search_radius',
        'max_attempts',
        'current_attempt',
        'started_at',
        'completed_at',
        'failed_at',
        'context',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'context' => 'array',
        'search_radius' => 'float',
    ];

    public const STATUS_SEARCHING = 'searching';
    public const STATUS_OFFERED = 'offered';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_FAILED = 'failed';
    public const STATUS_COMPLETED = 'completed';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(DispatchCandidate::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(DispatchAttempt::class);
    }
}
