<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverAssignment extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'driver_id',
        'dispatch_job_id',
        'status',
        'assigned_at',
        'accepted_at',
        'rejected_at',
        'cancelled_at',
        'note',
        'context',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'context' => 'array',
    ];

    public const STATUS_SEARCHING = 'searching';
    public const STATUS_OFFERED = 'offered';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_TIMED_OUT = 'timed_out';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_FAILED = 'failed';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function dispatchJob(): BelongsTo
    {
        return $this->belongsTo(DispatchJob::class, 'dispatch_job_id');
    }
}
