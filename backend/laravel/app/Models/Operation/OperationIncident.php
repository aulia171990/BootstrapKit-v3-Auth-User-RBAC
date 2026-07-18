<?php

namespace App\Models\Operation;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OperationIncident extends Model
{
    use HasUuids;

    protected $fillable = ['trip_id', 'driver_id', 'customer_id', 'type', 'status', 'priority', 'description', 'assigned_to', 'acknowledged_at', 'resolved_at', 'closed_at', 'metadata'];

    protected $casts = [
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(OperationAction::class);
    }
}
