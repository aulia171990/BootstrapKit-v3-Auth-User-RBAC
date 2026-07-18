<?php

namespace App\Models\Promotion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromotionCode extends Model
{
    use HasUuids;

    protected $fillable = [
        'promotion_id', 'code', 'type', 'max_single_uses', 'current_uses', 'metadata',
    ];

    protected $casts = [
        'max_single_uses' => 'integer',
        'current_uses' => 'integer',
        'metadata' => 'array',
    ];

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }
}
