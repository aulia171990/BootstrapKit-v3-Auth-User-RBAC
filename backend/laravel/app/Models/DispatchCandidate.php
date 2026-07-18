<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispatchCandidate extends Model
{
    use HasUuids;

    protected $fillable = [
        'dispatch_job_id',
        'driver_id',
        'distance',
        'estimated_arrival',
        'driver_rating',
        'acceptance_rate',
        'score',
        'offer_sent_at',
        'responded_at',
        'response',
    ];

    protected $casts = [
        'offer_sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'distance' => 'float',
        'estimated_arrival' => 'integer',
        'driver_rating' => 'float',
        'acceptance_rate' => 'float',
        'score' => 'float',
    ];

    public function dispatchJob(): BelongsTo
    {
        return $this->belongsTo(DispatchJob::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
