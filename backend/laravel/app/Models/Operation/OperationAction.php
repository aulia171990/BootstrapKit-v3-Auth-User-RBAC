<?php

namespace App\Models\Operation;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OperationAction extends Model
{
    use HasUuids;

    protected $fillable = ['incident_id', 'actor_id', 'action', 'notes', 'context'];

    protected $casts = [
        'context' => 'array',
    ];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(OperationIncident::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
