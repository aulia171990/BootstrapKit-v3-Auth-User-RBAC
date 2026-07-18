<?php

namespace App\Models\Operation;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OperationAlert extends Model
{
    use HasUuids;

    protected $fillable = ['type', 'severity', 'title', 'body', 'metadata', 'acknowledged_at', 'acknowledged_by'];

    protected $casts = [
        'acknowledged_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function acknowledger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
