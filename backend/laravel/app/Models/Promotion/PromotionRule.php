<?php

namespace App\Models\Promotion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromotionRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'promotion_id', 'type', 'operator', 'value', 'comparison_value', 'priority', 'active',
    ];

    protected $casts = [
        'value' => 'array',
        'comparison_value' => 'array',
        'active' => 'boolean',
        'priority' => 'integer',
    ];

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }
}
