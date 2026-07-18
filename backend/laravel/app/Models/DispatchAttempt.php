<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispatchAttempt extends Model
{
    use HasUuids;

    protected $fillable = [
        'dispatch_job_id',
        'driver_id',
        'attempt',
        'status',
        'sent_at',
        'responded_at',
        'response',
        'note',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public const STATUS_OFFERED = 'offered';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_TIMED_OUT = 'timed_out';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CANCELLED = 'cancelled';

    public function dispatchJob(): BelongsTo
    {
        return $this->belongsTo(DispatchJob::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
